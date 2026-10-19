package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Member;
import com.supermark.domain.Product;
import com.supermark.domain.SaleItem;
import com.supermark.domain.SaleOrder;
import com.supermark.dto.sale.SaleItemRequest;
import com.supermark.dto.sale.SaleItemResponse;
import com.supermark.dto.sale.SaleListResponse;
import com.supermark.dto.sale.SaleRequest;
import com.supermark.dto.sale.SaleResponse;
import com.supermark.dto.sale.SaleTodayResponse;
import com.supermark.repository.MemberRepository;
import com.supermark.repository.ProductRepository;
import com.supermark.repository.SaleItemRepository;
import com.supermark.repository.SaleOrderRepository;
import com.supermark.security.LoginUser;
import com.supermark.security.UserContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SaleService {

    private final SaleOrderRepository orderRepository;
    private final SaleItemRepository itemRepository;
    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final OrderNoGenerator orderNoGenerator;

    public SaleService(SaleOrderRepository orderRepository, SaleItemRepository itemRepository,
                       ProductRepository productRepository, MemberRepository memberRepository,
                       OrderNoGenerator orderNoGenerator) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.productRepository = productRepository;
        this.memberRepository = memberRepository;
        this.orderNoGenerator = orderNoGenerator;
    }

    @Transactional
    public SaleResponse create(SaleRequest req) {
        if (req.items() == null || req.items().isEmpty()) throw new BizException(40001, "销售明细不能为空");
        LoginUser cashier = UserContext.get();
        if (cashier == null) throw new BizException(40101, "未登录或登录已过期");

        Member member = null;
        if (req.memberId() != null) {
            member = memberRepository.findById(req.memberId()).orElse(null);
        }

        SaleOrder order = new SaleOrder(orderNoGenerator.next("SO"), cashier.id(), cashier.realName());
        if (member != null) {
            order.setMemberId(member.getId());
            order.setMemberName(member.getName());
        }
        // 先持久化订单以拿到自增主键，再用于销售明细的 orderId 外键
        order = orderRepository.save(order);

        List<SaleItemResponse> itemResponses = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (SaleItemRequest it : req.items()) {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new BizException(40040, "商品不存在 id=" + it.productId()));
            if (product.getStock() < it.quantity()) {
                throw new BizException(40070, "商品库存不足：" + product.getName());
            }
            BigDecimal unitPrice = product.getSalePrice();
            SaleItem si = new SaleItem(order.getId(), product.getId(), product.getName(), product.getUnit(),
                    it.quantity(), unitPrice);
            itemRepository.save(si);
            product.setStock(product.getStock() - it.quantity());
            productRepository.save(product);
            total = total.add(si.getSubtotal());
            itemResponses.add(new SaleItemResponse(product.getId(), product.getName(), product.getUnit(),
                    it.quantity(), unitPrice, si.getSubtotal()));
        }
        order.setTotalAmount(total);

        // discounts
        BigDecimal discount = BigDecimal.ZERO;
        if (member != null) {
            if (req.usePoints() != null && req.usePoints() > 0) {
                int usable = Math.min(req.usePoints(), member.getPoints());
                BigDecimal pointsDiscount = BigDecimal.valueOf(usable).divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_DOWN);
                pointsDiscount = pointsDiscount.min(total);
                discount = discount.add(pointsDiscount);
                member.setPoints(member.getPoints() - usable);
            }
            if (req.balanceAmount() != null && req.balanceAmount().compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal bal = req.balanceAmount().min(member.getBalance()).min(total.subtract(discount));
                discount = discount.add(bal);
                member.setBalance(member.getBalance().subtract(bal));
            }
            // points earned: 1 point per 1 yuan spent (floor) on the amount actually paid
            BigDecimal paidBase = total.subtract(discount);
            int earned = paidBase.setScale(0, BigDecimal.ROUND_DOWN).intValue();
            member.setPoints(member.getPoints() + earned);
            order.setPointsEarned(earned);
            memberRepository.save(member);
        }

        order.setDiscountAmount(discount);
        order.setPayAmount(total.subtract(discount));
        order.setPayType(req.payType());
        order.setRemark(req.remark());
        orderRepository.save(order);

        return new SaleResponse(order.getId(), order.getOrderNo(), order.getMemberName(),
                order.getTotalAmount(), order.getDiscountAmount(), order.getPayAmount(),
                order.getPayType(), order.getPointsEarned(), itemResponses, order.getCreatedAt());
    }

    public PageResult<SaleListResponse> page(int page, int size, String startDate, String endDate, String orderNo) {
        LocalDateTime start = parseStart(startDate);
        LocalDateTime end = parseEnd(endDate);
        Page<SaleOrder> p = orderRepository.search(start, end, orderNo,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id")));
        List<SaleListResponse> list = p.getContent().stream().map(o ->
                new SaleListResponse(o.getId(), o.getOrderNo(), o.getMemberName(), o.getCashierName(),
                        o.getPayAmount(), itemRepository.findByOrderId(o.getId()).size(), o.getPayType(), o.getCreatedAt()))
                .toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public SaleResponse detail(Long id) {
        SaleOrder order = orderRepository.findById(id).orElseThrow(() -> new BizException(40070, "销售单不存在"));
        List<SaleItemResponse> items = itemRepository.findByOrderId(id).stream().map(si ->
                new SaleItemResponse(si.getProductId(), si.getProductName(), si.getUnit(),
                        si.getQuantity(), si.getUnitPrice(), si.getSubtotal())).toList();
        return new SaleResponse(order.getId(), order.getOrderNo(), order.getMemberName(),
                order.getTotalAmount(), order.getDiscountAmount(), order.getPayAmount(),
                order.getPayType(), order.getPointsEarned(), items, order.getCreatedAt());
    }

    public SaleTodayResponse today() {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        List<SaleOrder> orders = orderRepository.findByCreatedAtBetween(start, end);
        BigDecimal total = orders.stream().map(SaleOrder::getPayAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avg = orders.isEmpty() ? BigDecimal.ZERO :
                total.divide(BigDecimal.valueOf(orders.size()), 2, BigDecimal.ROUND_HALF_UP);
        return new SaleTodayResponse(orders.size(), total, avg);
    }

    private LocalDateTime parseStart(String d) {
        if (d == null || d.isBlank()) return null;
        return java.time.LocalDate.parse(d).atStartOfDay();
    }

    private LocalDateTime parseEnd(String d) {
        if (d == null || d.isBlank()) return null;
        return java.time.LocalDate.parse(d).atTime(23, 59, 59);
    }
}
