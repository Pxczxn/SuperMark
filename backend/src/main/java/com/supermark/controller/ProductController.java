package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.product.ProductRequest;
import com.supermark.dto.product.ProductResponse;
import com.supermark.dto.product.ProductStatusRequest;
import com.supermark.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ApiResponse<PageResult<ProductResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(required = false) String keyword,
                                                        @RequestParam(required = false) Long categoryId,
                                                        @RequestParam(required = false) Integer status,
                                                        @RequestParam(defaultValue = "false") boolean lowStock) {
        return ApiResponse.ok(productService.page(page, size, keyword, categoryId, status, lowStock));
    }

    @GetMapping("/barcode/{barcode}")
    public ApiResponse<ProductResponse> byBarcode(@PathVariable String barcode) {
        return ApiResponse.ok(productService.byBarcode(barcode));
    }

    @PostMapping
    public ApiResponse<ProductResponse> create(@Valid @RequestBody ProductRequest req) {
        return ApiResponse.ok(productService.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<ProductResponse> update(@PathVariable Long id, @Valid @RequestBody ProductRequest req) {
        return ApiResponse.ok(productService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ApiResponse.ok();
    }

    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(@PathVariable Long id, @Valid @RequestBody ProductStatusRequest req) {
        productService.updateStatus(id, req);
        return ApiResponse.ok();
    }
}
