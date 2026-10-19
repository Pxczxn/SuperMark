package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.supplier.SupplierRequest;
import com.supermark.dto.supplier.SupplierResponse;
import com.supermark.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ApiResponse<PageResult<SupplierResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(supplierService.page(page, size, keyword));
    }

    @GetMapping("/all")
    public ApiResponse<List<SupplierResponse>> all() {
        return ApiResponse.ok(supplierService.all());
    }

    @PostMapping
    public ApiResponse<SupplierResponse> create(@Valid @RequestBody SupplierRequest req) {
        return ApiResponse.ok(supplierService.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<SupplierResponse> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest req) {
        return ApiResponse.ok(supplierService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ApiResponse.ok();
    }
}
