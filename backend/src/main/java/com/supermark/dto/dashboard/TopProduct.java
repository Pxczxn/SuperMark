package com.supermark.dto.dashboard;

import java.math.BigDecimal;

public record TopProduct(String productName, Integer quantity, BigDecimal amount) {}
