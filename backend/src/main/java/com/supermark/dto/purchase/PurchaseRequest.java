package com.supermark.dto.purchase;

import java.util.List;

public record PurchaseRequest(Long supplierId, String remark, List<PurchaseItemRequest> items) {}
