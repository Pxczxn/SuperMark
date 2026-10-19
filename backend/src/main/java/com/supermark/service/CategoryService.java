package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Category;
import com.supermark.dto.category.CategoryRequest;
import com.supermark.dto.category.CategoryResponse;
import com.supermark.repository.CategoryRepository;
import com.supermark.repository.ProductRepository;
import com.supermark.security.UserContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public PageResult<CategoryResponse> page(int page, int size, String keyword) {
        Specification<Category> spec = (root, q, cb) ->
                !StringUtils.hasText(keyword) ? cb.conjunction() : cb.like(root.get("name"), "%" + keyword + "%");
        Page<Category> p = categoryRepository.findAll(spec,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.ASC, "sort")));
        List<CategoryResponse> list = p.getContent().stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getSort(), c.getRemark()))
                .toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public List<CategoryResponse> all() {
        return categoryRepository.findAll(Sort.by(Sort.Direction.ASC, "sort")).stream()
                .map(c -> new CategoryResponse(c.getId(), c.getName(), c.getSort(), c.getRemark()))
                .toList();
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        requireAdmin();
        Category c = new Category(req.name(), req.sort() == null ? 0 : req.sort(), req.remark());
        c = categoryRepository.save(c);
        return new CategoryResponse(c.getId(), c.getName(), c.getSort(), c.getRemark());
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        requireAdmin();
        Category c = categoryRepository.findById(id).orElseThrow(() -> new BizException(40020, "分类不存在"));
        c.setName(req.name());
        c.setSort(req.sort());
        c.setRemark(req.remark());
        return new CategoryResponse(c.getId(), c.getName(), c.getSort(), c.getRemark());
    }

    @Transactional
    public void delete(Long id) {
        requireAdmin();
        if (productRepository.existsByCategoryId(id)) {
            throw new BizException(40020, "该分类下存在商品，无法删除");
        }
        categoryRepository.deleteById(id);
    }

    private void requireAdmin() {
        if (!UserContext.isAdmin()) throw new BizException(40300, "无权限");
    }
}
