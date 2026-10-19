package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.dto.dashboard.DashboardSummary;
import com.supermark.dto.dashboard.TopProduct;
import com.supermark.dto.dashboard.TrendPoint;
import com.supermark.service.DashboardService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    public ApiResponse<DashboardSummary> summary() {
        return ApiResponse.ok(dashboardService.summary());
    }

    @GetMapping("/trend")
    public ApiResponse<List<TrendPoint>> trend(@RequestParam(defaultValue = "7") int days) {
        return ApiResponse.ok(dashboardService.trend(days));
    }

    @GetMapping("/top-products")
    public ApiResponse<List<TopProduct>> top(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.ok(dashboardService.topProducts(limit));
    }
}
