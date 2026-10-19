package com.supermark.dto.purchase;

import java.math.BigDecimal;

public record PurchaseItemRequest(Long productId, Integer quantity, BigDecimal unitPrice) {}
