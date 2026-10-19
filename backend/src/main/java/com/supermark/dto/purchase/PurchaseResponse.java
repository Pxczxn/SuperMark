package com.supermark.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record PurchaseResponse(Long id, String orderNo, Long supplierId, String supplierName,
                              BigDecimal totalAmount, List<PurchaseItemResponse> items,
                              LocalDateTime createdAt) {}
