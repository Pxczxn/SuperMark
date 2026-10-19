package com.supermark.dto.product;

import java.math.BigDecimal;

public record ProductResponse(Long id, String name, String barcode, Long categoryId, String categoryName,
                              String unit, BigDecimal purchasePrice, BigDecimal salePrice,
                              Integer stock, Integer warnStock, Integer status, String remark) {}
