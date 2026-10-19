package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Product;
import com.supermark.domain.PurchaseItem;
import com.supermark.domain.PurchaseOrder;
import com.supermark.domain.Supplier;
import com.supermark.dto.purchase.PurchaseItemRequest;
import com.supermark.dto.purchase.PurchaseItemResponse;
import com.supermark.dto.purchase.PurchaseListResponse;
import com.supermark.dto.purchase.PurchaseRequest;
import com.supermark.dto.purchase.PurchaseResponse;
import com.supermark.repository.ProductRepository;
import com.supermark.repository.PurchaseItemRepository;
import com.supermark.repository.PurchaseOrderRepository;
import com.supermark.repository.SupplierRepository;
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
public class PurchaseService {

    private final PurchaseOrderRepository orderRepository;
    private final PurchaseItemRepository itemRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final OrderNoGenerator orderNoGenerator;

    public PurchaseService(PurchaseOrderRepository orderRepository, PurchaseItemRepository itemRepository,
                           SupplierRepository supplierRepository, ProductRepository productRepository,
                           OrderNoGenerator orderNoGenerator) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.orderNoGenerator = orderNoGenerator;
    }

    @Transactional
    public PurchaseResponse create(PurchaseRequest req) {
        if (!UserContext.isAdmin()) throw new BizException(40300, "无权限");
        if (req.items() == null || req.items().isEmpty()) throw new BizException(40001, "入库明细不能为空");
        Supplier supplier = supplierRepository.findById(req.supplierId())
                .orElseThrow(() -> new BizException(40050, "供应商不存在"));
        PurchaseOrder order = new PurchaseOrder(orderNoGenerator.next("PI"), supplier.getId(), supplier.getName(), req.remark());
        order = orderRepository.save(order);

        List<PurchaseItemResponse> itemResponses = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseItemRequest it : req.items()) {
            Product product = productRepository.findById(it.productId())
                    .orElseThrow(() -> new BizException(40040, "商品不存在 id=" + it.productId()));
            BigDecimal unitPrice = it.unitPrice() == null ? BigDecimal.ZERO : it.unitPrice();
            PurchaseItem pi = new PurchaseItem(order.getId(), product.getId(), product.getName(),
                    it.quantity(), unitPrice);
            itemRepository.save(pi);
            product.setStock(product.getStock() + it.quantity());
            productRepository.save(product);
            total = total.add(pi.getSubtotal());
            itemResponses.add(new PurchaseItemResponse(product.getId(), product.getName(),
                    it.quantity(), unitPrice, pi.getSubtotal()));
        }
        order.setTotalAmount(total);
        orderRepository.save(order);
        return toResponse(order, itemResponses);
    }

    public PageResult<PurchaseListResponse> page(int page, int size, String startDate, String endDate, Long supplierId) {
        LocalDateTime start = parseStart(startDate);
        LocalDateTime end = parseEnd(endDate);
        Page<PurchaseOrder> p = orderRepository.search(start, end, supplierId,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id")));
        List<PurchaseListResponse> list = p.getContent().stream().map(o ->
                new PurchaseListResponse(o.getId(), o.getOrderNo(), o.getSupplierName(),
                        o.getTotalAmount(), itemRepository.findByOrderId(o.getId()).size(), o.getCreatedAt()))
                .toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public PurchaseResponse detail(Long id) {
        PurchaseOrder order = orderRepository.findById(id).orElseThrow(() -> new BizException(40050, "入库单不存在"));
        List<PurchaseItemResponse> items = itemRepository.findByOrderId(id).stream().map(pi ->
                new PurchaseItemResponse(pi.getProductId(), pi.getProductName(), pi.getQuantity(), pi.getUnitPrice(), pi.getSubtotal()))
                .toList();
        return toResponse(order, items);
    }

    private PurchaseResponse toResponse(PurchaseOrder order, List<PurchaseItemResponse> items) {
        return new PurchaseResponse(order.getId(), order.getOrderNo(), order.getSupplierId(), order.getSupplierName(),
                order.getTotalAmount(), items, order.getCreatedAt());
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
