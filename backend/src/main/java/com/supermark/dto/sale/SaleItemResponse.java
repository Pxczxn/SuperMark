package com.supermark.dto.sale;

import java.math.BigDecimal;

public record SaleItemResponse(Long productId, String productName, String unit,
                               Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
