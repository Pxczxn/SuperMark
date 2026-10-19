package com.supermark.dto.sale;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SaleResponse(Long id, String orderNo, String memberName,
                           BigDecimal totalAmount, BigDecimal discountAmount, BigDecimal payAmount,
                           Integer payType, Integer pointsEarned, List<SaleItemResponse> items,
                           LocalDateTime createdAt) {}
