package com.supermark.dto.dashboard;

import java.math.BigDecimal;

public record DashboardSummary(BigDecimal todaySales, Integer todayOrders, Long totalProducts,
                               Long lowStockCount, Long memberCount, BigDecimal totalStockValue) {}
