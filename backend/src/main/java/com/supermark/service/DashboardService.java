package com.supermark.service;

import com.supermark.common.PageResult;
import com.supermark.domain.Product;
import com.supermark.domain.SaleItem;
import com.supermark.domain.SaleOrder;
import com.supermark.dto.dashboard.DashboardSummary;
import com.supermark.dto.dashboard.TopProduct;
import com.supermark.dto.dashboard.TrendPoint;
import com.supermark.dto.product.ProductResponse;
import com.supermark.repository.MemberRepository;
import com.supermark.repository.ProductRepository;
import com.supermark.repository.SaleItemRepository;
import com.supermark.repository.SaleOrderRepository;
import com.supermark.security.UserContext;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private final ProductRepository productRepository;
    private final MemberRepository memberRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductService productService;

    public DashboardService(ProductRepository productRepository, MemberRepository memberRepository,
                            SaleOrderRepository saleOrderRepository, SaleItemRepository saleItemRepository,
                            ProductService productService) {
        this.productRepository = productRepository;
        this.memberRepository = memberRepository;
        this.saleOrderRepository = saleOrderRepository;
        this.saleItemRepository = saleItemRepository;
        this.productService = productService;
    }

    public DashboardSummary summary() {
        LocalDateTime start = LocalDateTime.now().toLocalDate().atStartOfDay();
        LocalDateTime end = start.plusDays(1).minusNanos(1);
        List<SaleOrder> todayOrders = saleOrderRepository.findByCreatedAtBetween(start, end);
        BigDecimal todaySales = todayOrders.stream().map(SaleOrder::getPayAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalProducts = productRepository.count();
        long lowStock = productRepository.findAll().stream().filter(p -> p.getStock() <= p.getWarnStock()).count();
        long memberCount = memberRepository.count();
        BigDecimal stockValue = productRepository.findAll().stream()
                .map(p -> p.getPurchasePrice().multiply(BigDecimal.valueOf(p.getStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardSummary(todaySales, todayOrders.size(), totalProducts, lowStock, memberCount, stockValue);
    }

    public List<TrendPoint> trend(int days) {
        List<TrendPoint> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = days - 1; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            LocalDateTime start = d.atStartOfDay();
            LocalDateTime end = start.plusDays(1).minusNanos(1);
            List<SaleOrder> orders = saleOrderRepository.findByCreatedAtBetween(start, end);
            BigDecimal amount = orders.stream().map(SaleOrder::getPayAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(new TrendPoint(d.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")), amount, (long) orders.size()));
        }
        return result;
    }

    public List<TopProduct> topProducts(int limit) {
        LocalDateTime start = LocalDateTime.now().minusDays(30);
        // 取近 30 天订单，再按 orderId 批量取明细，避免逐条 findById，且对脏数据（orderId 为空）免疫
        List<Long> recentOrderIds = saleOrderRepository
                .findByCreatedAtBetween(start, LocalDateTime.now().plusSeconds(1))
                .stream().map(SaleOrder::getId).toList();
        List<SaleItem> items = recentOrderIds.isEmpty()
                ? List.of()
                : saleItemRepository.findByOrderIdIn(recentOrderIds);
        Map<String, TopProduct> map = new LinkedHashMap<>();
        for (SaleItem si : items) {
            TopProduct tp = map.computeIfAbsent(si.getProductName(),
                    k -> new TopProduct(k, 0, BigDecimal.ZERO));
            map.put(si.getProductName(), new TopProduct(si.getProductName(),
                    tp.quantity() + si.getQuantity(),
                    tp.amount().add(si.getSubtotal())));
        }
        return map.values().stream()
                .sorted((a, b) -> b.amount().compareTo(a.amount()))
                .limit(limit)
                .toList();
    }
}
