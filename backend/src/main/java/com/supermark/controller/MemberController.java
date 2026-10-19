package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.common.PageResult;
import com.supermark.dto.member.MemberRequest;
import com.supermark.dto.member.MemberResponse;
import com.supermark.dto.member.RechargeRequest;
import com.supermark.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ApiResponse<PageResult<MemberResponse>> page(@RequestParam(defaultValue = "1") int page,
                                                        @RequestParam(defaultValue = "10") int size,
                                                        @RequestParam(required = false) String keyword,
                                                        @RequestParam(required = false) String phone) {
        return ApiResponse.ok(memberService.page(page, size, keyword, phone));
    }

    @GetMapping("/phone/{phone}")
    public ApiResponse<MemberResponse> byPhone(@PathVariable String phone) {
        return ApiResponse.ok(memberService.byPhone(phone));
    }

    @PostMapping
    public ApiResponse<MemberResponse> create(@Valid @RequestBody MemberRequest req) {
        return ApiResponse.ok(memberService.create(req));
    }

    @PutMapping("/{id}")
    public ApiResponse<MemberResponse> update(@PathVariable Long id, @Valid @RequestBody MemberRequest req) {
        return ApiResponse.ok(memberService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        memberService.delete(id);
        return ApiResponse.ok();
    }

    @PostMapping("/{id}/recharge")
    public ApiResponse<MemberResponse> recharge(@PathVariable Long id, @Valid @RequestBody RechargeRequest req) {
        return ApiResponse.ok(memberService.recharge(id, req));
    }
}
