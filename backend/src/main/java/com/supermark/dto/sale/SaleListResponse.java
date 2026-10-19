package com.supermark.dto.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SaleListResponse(Long id, String orderNo, String memberName, String cashierName,
                               BigDecimal totalAmount, Integer itemCount, Integer payType,
                               LocalDateTime createdAt) {}
