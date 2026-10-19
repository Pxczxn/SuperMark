package com.supermark.dto.product;

import java.math.BigDecimal;

public record ProductRequest(String name, String barcode, Long categoryId, String unit,
                             BigDecimal purchasePrice, BigDecimal salePrice,
                             Integer stock, Integer warnStock, Integer status, String remark) {}
