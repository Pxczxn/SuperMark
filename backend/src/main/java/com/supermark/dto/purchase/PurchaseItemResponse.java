package com.supermark.dto.purchase;

import java.math.BigDecimal;

public record PurchaseItemResponse(Long productId, String productName, Integer quantity, BigDecimal unitPrice, BigDecimal subtotal) {}
