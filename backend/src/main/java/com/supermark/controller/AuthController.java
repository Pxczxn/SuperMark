package com.supermark.controller;

import com.supermark.common.ApiResponse;
import com.supermark.dto.auth.LoginRequest;
import com.supermark.dto.auth.LoginResponse;
import com.supermark.dto.auth.UserInfo;
import com.supermark.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest req) {
        return ApiResponse.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ApiResponse<UserInfo> me() {
        return ApiResponse.ok(authService.me());
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {
        return authService.logout();
    }
}
