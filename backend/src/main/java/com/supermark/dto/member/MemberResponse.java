package com.supermark.dto.member;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MemberResponse(Long id, String name, String phone, Integer gender,
                             Integer points, BigDecimal balance, LocalDateTime createdAt) {}
