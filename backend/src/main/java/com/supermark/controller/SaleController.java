package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.sale.SaleListResponse;
import com.supermark.dto.sale.SaleRequest;
import com.supermark.dto.sale.SaleResponse;
import com.supermark.dto.sale.SaleTodayResponse;
import com.supermark.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ApiResponse<SaleResponse> create(@Valid @RequestBody SaleRequest req) {
        return ApiResponse.ok(saleService.create(req));
    }

    @GetMapping
    public ApiResponse<PageResult<SaleListResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                         @RequestParam(defaultValue = "10") int size,
                                                         @RequestParam(required = false) String startDate,
                                                         @RequestParam(required = false) String endDate,
                                                         @RequestParam(required = false) String orderNo) {
        return ApiResponse.ok(saleService.page(page, size, startDate, endDate, orderNo));
    }

    @GetMapping("/{id}")
    public ApiResponse<SaleResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(saleService.detail(id));
    }

    @GetMapping("/today")
    public ApiResponse<SaleTodayResponse> today() {
        return ApiResponse.ok(saleService.today());
    }
}
