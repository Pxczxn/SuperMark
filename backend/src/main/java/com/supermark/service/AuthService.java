package com.supermark.service;

import com.supermark.common.ApiResponse;
import com.supermark.common.BizException;
import com.supermark.domain.User;
import com.supermark.dto.auth.LoginRequest;
import com.supermark.dto.auth.LoginResponse;
import com.supermark.dto.auth.UserInfo;
import com.supermark.repository.UserRepository;
import com.supermark.security.JwtUtil;
import com.supermark.security.LoginUser;
import com.supermark.security.UserContext;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest req) {
        User user = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new BizException(40010, "用户名或密码错误"));
        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new BizException(40010, "账号已被禁用");
        }
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new BizException(40010, "用户名或密码错误");
        }
        String token = jwtUtil.generate(user.getUsername(), user.getRole());
        UserInfo info = new UserInfo(user.getId(), user.getUsername(), user.getRealName(), user.getRole());
        return new LoginResponse(token, info);
    }

    public UserInfo me() {
        LoginUser u = UserContext.get();
        if (u == null) throw new BizException(40101, "未登录或登录已过期");
        return new UserInfo(u.id(), u.username(), u.realName(), u.role());
    }

    public ApiResponse<Void> logout() {
        UserContext.clear();
        return ApiResponse.ok();
    }
}
