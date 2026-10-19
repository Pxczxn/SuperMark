package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.category.CategoryRequest;
import com.supermark.dto.category.CategoryResponse;
import com.supermark.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ApiResponse<PageResult<CategoryResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                          @RequestParam(defaultValue = "10") int size,
                                                          @RequestParam(required = false) String keyword) {
        return ApiResponse.ok(categoryService.page(page, size, keyword));
    }

    @GetMapping("/all")
    public ApiResponse<List<CategoryResponse>> all() {
        return ApiResponse.ok(categoryService.all());
    }

    @PostMapping
    public ApiResponse<CategoryResponse> create(@Valid @RequestBody CategoryRequest req) {
        return ApiResponse.ok(categoryService.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id, @Valid @RequestBody CategoryRequest req) {
        return ApiResponse.ok(categoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.ok();
    }
}
