package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Supplier;
import com.supermark.dto.supplier.SupplierRequest;
import com.supermark.dto.supplier.SupplierResponse;
import com.supermark.repository.PurchaseItemRepository;
import com.supermark.repository.PurchaseOrderRepository;
import com.supermark.repository.SupplierRepository;
import com.supermark.security.UserContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseItemRepository purchaseItemRepository;

    public SupplierService(SupplierRepository supplierRepository,
                           PurchaseOrderRepository purchaseOrderRepository,
                           PurchaseItemRepository purchaseItemRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseItemRepository = purchaseItemRepository;
    }

    public PageResult<SupplierResponse> page(int page, int size, String keyword) {
        Page<Supplier> p = supplierRepository.search(keyword, PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id")));
        List<SupplierResponse> list = p.getContent().stream().map(this::toResponse).toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public List<SupplierResponse> all() {
        return supplierRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream().map(this::toResponse).toList();
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        requireAdmin();
        Supplier s = new Supplier(req.name(), req.contact(), req.phone(), req.address(), req.remark());
        s = supplierRepository.save(s);
        return toResponse(s);
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        requireAdmin();
        Supplier s = supplierRepository.findById(id).orElseThrow(() -> new BizException(40050, "供应商不存在"));
        s.setName(req.name());
        s.setContact(req.contact());
        s.setPhone(req.phone());
        s.setAddress(req.address());
        s.setRemark(req.remark());
        return toResponse(s);
    }

    @Transactional
    public void delete(Long id) {
        requireAdmin();
        if (!purchaseOrderRepository.findBySupplierIdAlias(id).isEmpty()) {
            throw new BizException(40050, "该供应商已有进货单，无法删除");
        }
        supplierRepository.deleteById(id);
    }

    public SupplierResponse toResponse(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getContact(), s.getPhone(), s.getAddress(), s.getRemark());
    }

    private void requireAdmin() {
        if (!UserContext.isAdmin()) throw new BizException(40300, "无权限");
    }
}
