package com.supermark.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String barcode;

    private Long categoryId;

    private String unit = "个";

    @Column(precision = 12, scale = 2)
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Column(precision = 12, scale = 2)
    private BigDecimal salePrice = BigDecimal.ZERO;

    private Integer stock = 0;

    private Integer warnStock = 0;

    private Integer status = 1; // 1 上架 0 下架

    private String remark;

    private LocalDateTime createdAt;

    public Product() {}
    public Product(String name, String barcode, Long categoryId, String unit,
                   BigDecimal purchasePrice, BigDecimal salePrice, Integer stock, Integer warnStock, String remark) {
        this.name = name; this.barcode = barcode; this.categoryId = categoryId; this.unit = unit;
        this.purchasePrice = purchasePrice; this.salePrice = salePrice; this.stock = stock;
        this.warnStock = warnStock; this.remark = remark;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getBarcode() { return barcode; }
    public void setBarcode(String barcode) { this.barcode = barcode; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }
    public BigDecimal getSalePrice() { return salePrice; }
    public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public Integer getWarnStock() { return warnStock; }
    public void setWarnStock(Integer warnStock) { this.warnStock = warnStock; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public String getRemark() { return remark; }
    public void setRemark(String remark) { this.remark = remark; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
