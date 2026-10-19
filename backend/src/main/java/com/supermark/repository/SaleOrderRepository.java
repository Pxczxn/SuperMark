package com.supermark.repository;

import com.supermark.domain.SaleOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleOrderRepository extends JpaRepository<SaleOrder, Long> {

    @Query("SELECT o FROM SaleOrder o WHERE "
            + "(:start IS NULL OR o.createdAt >= :start) "
            + "AND (:end IS NULL OR o.createdAt <= :end) "
            + "AND (:orderNo IS NULL OR :orderNo = '' OR o.orderNo LIKE %:orderNo%)")
    Page<SaleOrder> search(@Param("start") LocalDateTime start,
                           @Param("end") LocalDateTime end,
                           @Param("orderNo") String orderNo,
                           Pageable pageable);

    List<SaleOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
