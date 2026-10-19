package com.supermark.repository;

import com.supermark.domain.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    List<SaleItem> findByOrderId(Long orderId);

    List<SaleItem> findByProductId(Long productId);

    List<SaleItem> findByOrderIdIn(List<Long> orderIds);
}
