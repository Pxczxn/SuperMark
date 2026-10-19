package com.supermark.dto.auth;

public record LoginResponse(String token, UserInfo user) {}
