package com.supermark.service;

import com.supermark.common.BizException;
import com.supermark.common.PageResult;
import com.supermark.domain.Member;
import com.supermark.dto.member.MemberRequest;
import com.supermark.dto.member.MemberResponse;
import com.supermark.dto.member.RechargeRequest;
import com.supermark.repository.MemberRepository;
import com.supermark.security.UserContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public PageResult<MemberResponse> page(int page, int size, String keyword, String phone) {
        Page<Member> p = memberRepository.search(keyword, phone,
                PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "id")));
        List<MemberResponse> list = p.getContent().stream().map(this::toResponse).toList();
        return new PageResult<>(list, p.getTotalElements(), page, size);
    }

    public MemberResponse byPhone(String phone) {
        Member m = memberRepository.findByPhone(phone)
                .orElseThrow(() -> new BizException(40060, "未找到该手机号会员"));
        return toResponse(m);
    }

    public MemberResponse get(Long id) {
        return toResponse(memberRepository.findById(id).orElseThrow(() -> new BizException(40060, "会员不存在")));
    }

    @Transactional
    public MemberResponse create(MemberRequest req) {
        if (req.name() == null || req.name().isBlank()) throw new BizException(40001, "会员姓名必填");
        if (req.phone() == null || req.phone().isBlank()) throw new BizException(40001, "会员手机号必填");
        if (memberRepository.existsByPhone(req.phone())) throw new BizException(40061, "手机号已存在");
        Member m = new Member(req.name(), req.phone(), req.gender() == null ? 0 : req.gender());
        m = memberRepository.save(m);
        return toResponse(m);
    }

    @Transactional
    public MemberResponse update(Long id, MemberRequest req) {
        Member m = memberRepository.findById(id).orElseThrow(() -> new BizException(40060, "会员不存在"));
        if (req.phone() != null && !req.phone().equals(m.getPhone()) && memberRepository.existsByPhone(req.phone())) {
            throw new BizException(40061, "手机号已存在");
        }
        m.setName(req.name());
        m.setPhone(req.phone());
        m.setGender(req.gender());
        return toResponse(m);
    }

    @Transactional
    public void delete(Long id) {
        requireAdmin();
        memberRepository.deleteById(id);
    }

    @Transactional
    public MemberResponse recharge(Long id, RechargeRequest req) {
        requireAdmin();
        Member m = memberRepository.findById(id).orElseThrow(() -> new BizException(40060, "会员不存在"));
        if (req.amount() == null || req.amount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BizException(40001, "充值金额必须大于0");
        }
        m.setBalance(m.getBalance().add(req.amount()));
        return toResponse(m);
    }

    public MemberResponse toResponse(Member m) {
        return new MemberResponse(m.getId(), m.getName(), m.getPhone(), m.getGender(),
                m.getPoints(), m.getBalance(), m.getCreatedAt());
    }

    private void requireAdmin() {
        if (!UserContext.isAdmin()) throw new BizException(40300, "无权限");
    }
}
