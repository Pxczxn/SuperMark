package com.supermark.dto.sale;

import java.math.BigDecimal;
import java.util.List;

public record SaleRequest(Long memberId, Integer payType, String remark,
                          Integer usePoints, BigDecimal balanceAmount,
                          List<SaleItemRequest> items) {}
