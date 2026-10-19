package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.purchase.PurchaseListResponse;
import com.supermark.dto.purchase.PurchaseRequest;
import com.supermark.dto.purchase.PurchaseResponse;
import com.supermark.service.PurchaseService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    private final PurchaseService purchaseService;

    public PurchaseController(PurchaseService purchaseService) {
        this.purchaseService = purchaseService;
    }

    @PostMapping
    public ApiResponse<PurchaseResponse> create(@Valid @RequestBody PurchaseRequest req) {
        return ApiResponse.ok(purchaseService.create(req));
    }

    @GetMapping
    public ApiResponse<PageResult<PurchaseListResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                              @RequestParam(defaultValue = "10") int size,
                                                              @RequestParam(required = false) String startDate,
                                                              @RequestParam(required = false) String endDate,
                                                              @RequestParam(required = false) Long supplierId) {
        return ApiResponse.ok(purchaseService.page(page, size, startDate, endDate, supplierId));
    }

    @GetMapping("/{id}")
    public ApiResponse<PurchaseResponse> detail(@PathVariable Long id) {
        return ApiResponse.ok(purchaseService.detail(id));
    }
}
