package com.supermark.dto.sale;

import java.math.BigDecimal;

public record SaleTodayResponse(Integer orderCount, BigDecimal totalAmount, BigDecimal avgAmount) {}
