package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Category;
import com.supermark.domain.Product;
import com.supermark.dto.product.ProductRequest;
import com.supermark.dto.product.ProductResponse;
import com.supermark.dto.product.ProductStatusRequest;
import com.supermark.repository.CategoryRepository;
import com.supermark.repository.ProductRepository;
import com.supermark.repository.PurchaseItemRepository;
import com.supermark.repository.SaleItemRepository;
import com.supermark.security.UserContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final SaleItemRepository saleItemRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository,
                          PurchaseItemRepository purchaseItemRepository, SaleItemRepository saleItemRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.purchaseItemRepository = purchaseItemRepository;
        this.saleItemRepository = saleItemRepository;
    }

    public PageResult<ProductResponse> page(int page, int size, String keyword, Long categoryId,
                                            Integer status, boolean lowStock) {
        Page<Product> p = productRepository.search(
                keyword, categoryId, status, lowStock,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id")));
        List<ProductResponse> list = p.getContent().stream().map(this::toResponse).toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public ProductResponse byBarcode(String barcode) {
        Product p = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new BizException(40040, "未找到条码对应商品"));
        return toResponse(p);
    }

    public ProductResponse get(Long id) {
        return toResponse(productRepository.findById(id).orElseThrow(() -> new BizException(40040, "商品不存在")));
    }

    @Transactional
    public ProductResponse create(ProductRequest req) {
        requireAdmin();
        if (req.barcode() != null && !req.barcode().isBlank() && productRepository.existsByBarcode(req.barcode())) {
            throw new BizException(40030, "条码已存在");
        }
        Product p = new Product(req.name(), req.barcode(), req.categoryId(), req.unit(),
                nz(req.purchasePrice()), nz(req.salePrice()),
                nzInt(req.stock()), nzInt(req.warnStock()), req.remark());
        p.setStatus(req.status() == null ? 1 : req.status());
        p = productRepository.save(p);
        return toResponse(p);
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest req) {
        requireAdmin();
        Product p = productRepository.findById(id).orElseThrow(() -> new BizException(40040, "商品不存在"));
        if (req.barcode() != null && !req.barcode().isBlank()
                && !req.barcode().equals(p.getBarcode())
                && productRepository.existsByBarcode(req.barcode())) {
            throw new BizException(40030, "条码已存在");
        }
        p.setName(req.name());
        p.setBarcode(req.barcode());
        p.setCategoryId(req.categoryId());
        p.setUnit(req.unit());
        p.setPurchasePrice(nz(req.purchasePrice()));
        p.setSalePrice(nz(req.salePrice()));
        p.setStock(nzInt(req.stock()));
        p.setWarnStock(nzInt(req.warnStock()));
        p.setStatus(req.status() == null ? p.getStatus() : req.status());
        p.setRemark(req.remark());
        return toResponse(p);
    }

    @Transactional
    public void delete(Long id) {
        requireAdmin();
        if (purchaseItemRepository.findByProductId(id).isEmpty()
                && saleItemRepository.findByProductId(id).isEmpty()) {
            productRepository.deleteById(id);
        } else {
            throw new BizException(40041, "该商品已有进货或销售记录，不可删除");
        }
    }

    @Transactional
    public void updateStatus(Long id, ProductStatusRequest req) {
        requireAdmin();
        Product p = productRepository.findById(id).orElseThrow(() -> new BizException(40040, "商品不存在"));
        p.setStatus(req.status());
    }

    public long lowStockCount() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStock() <= p.getWarnStock()).count();
    }

    public ProductResponse toResponse(Product p) {
        String categoryName = null;
        if (p.getCategoryId() != null) {
            Category c = categoryRepository.findById(p.getCategoryId()).orElse(null);
            if (c != null) categoryName = c.getName();
        }
        return new ProductResponse(p.getId(), p.getName(), p.getBarcode(), p.getCategoryId(), categoryName,
                p.getUnit(), p.getPurchasePrice(), p.getSalePrice(), p.getStock(), p.getWarnStock(),
                p.getStatus(), p.getRemark());
    }

    private java.math.BigDecimal nz(java.math.BigDecimal v) {
        return v == null ? java.math.BigDecimal.ZERO : v;
    }

    private Integer nzInt(Integer v) {
        return v == null ? 0 : v;
    }

    private void requireAdmin() {
        if (!UserContext.isAdmin()) throw new BizException(40300, "无权限");
    }

    public Product requireProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new BizException(40040, "商品不存在"));
    }

    public boolean isSame(Product p, Long id) {
        return Objects.equals(p.getId(), id);
    }
}
