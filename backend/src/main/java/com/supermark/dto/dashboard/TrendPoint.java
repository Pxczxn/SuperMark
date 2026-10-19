package com.supermark.dto.dashboard;

import java.math.BigDecimal;

public record TrendPoint(String date, BigDecimal amount, Long orders) {}
