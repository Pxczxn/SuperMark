package com.supermark.repository;

import com.supermark.domain.PurchaseItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PurchaseItemRepository extends JpaRepository<PurchaseItem, Long> {
    List<PurchaseItem> findByOrderId(Long orderId);
    List<PurchaseItem> findByProductId(Long productId);
}
