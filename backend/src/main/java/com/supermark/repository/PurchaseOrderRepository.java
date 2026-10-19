package com.supermark.repository;

import com.supermark.domain.PurchaseOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT o FROM PurchaseOrder o WHERE "
            + "(:start IS NULL OR o.createdAt >= :start) "
            + "AND (:end IS NULL OR o.createdAt <= :end) "
            + "AND (:supplierId IS NULL OR o.supplierId = :supplierId)")
    Page<PurchaseOrder> search(@Param("start") LocalDateTime start,
                               @Param("end") LocalDateTime end,
                               @Param("supplierId") Long supplierId,
                               Pageable pageable);

    @Query("SELECT o FROM PurchaseOrder o WHERE o.supplierId = :supplierId")
    List<PurchaseOrder> findBySupplierIdAlias(@Param("supplierId") Long supplierId);

    List<PurchaseOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
