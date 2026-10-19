package com.supermark.repository;

import com.supermark.domain.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    @Query("SELECT s FROM Supplier s WHERE (:keyword IS NULL OR :keyword = '' OR s.name LIKE %:keyword% OR s.contact LIKE %:keyword% OR s.phone LIKE %:keyword%)")
    Page<Supplier> search(@Param("keyword") String keyword, Pageable pageable);
}
