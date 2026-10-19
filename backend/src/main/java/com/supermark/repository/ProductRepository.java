package com.supermark.repository;

import com.supermark.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByBarcode(String barcode);

    boolean existsByBarcode(String barcode);

    boolean existsByCategoryId(Long categoryId);

    @Query("SELECT p FROM Product p WHERE (:keyword IS NULL OR :keyword = '' OR p.name LIKE %:keyword% OR p.barcode LIKE %:keyword%) "
            + "AND (:categoryId IS NULL OR p.categoryId = :categoryId) "
            + "AND (:status IS NULL OR p.status = :status) "
            + "AND (:lowStock = FALSE OR p.stock <= p.warnStock)")
    Page<Product> search(@Param("keyword") String keyword,
                         @Param("categoryId") Long categoryId,
                         @Param("status") Integer status,
                         @Param("lowStock") boolean lowStock,
                         Pageable pageable);
}
