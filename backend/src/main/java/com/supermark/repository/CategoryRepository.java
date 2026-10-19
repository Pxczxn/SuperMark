package com.supermark.repository;

import com.supermark.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Category> {
}
