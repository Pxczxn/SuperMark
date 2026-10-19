package com.supermark.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PurchaseListResponse(Long id, String orderNo, String supplierName, BigDecimal totalAmount,
                                   Integer itemCount, LocalDateTime createdAt) {}
