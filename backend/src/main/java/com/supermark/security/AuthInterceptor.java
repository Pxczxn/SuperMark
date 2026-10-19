package com.supermark.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.supermark.common.ApiResponse;
import com.supermark.domain.User;
import com.supermark.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.charset.StandardCharsets;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthInterceptor(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getRequestURI();
        if (path.equals("/api/auth/login") || path.equals("/api/auth/logout")) {
            return true;
        }
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return writeUnauthorized(response);
        }
        String token = header.substring(7);
        try {
            Claims claims = jwtUtil.parse(token);
            String username = claims.getSubject();
            User user = userRepository.findByUsername(username).orElse(null);
            if (user == null || !Boolean.TRUE.equals(user.getEnabled())) {
                return writeUnauthorized(response);
            }
            UserContext.set(new LoginUser(user.getId(), user.getUsername(), user.getRealName(), user.getRole()));
            return true;
        } catch (Exception e) {
            return writeUnauthorized(response);
        }
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        UserContext.clear();
    }

    private boolean writeUnauthorized(HttpServletResponse response) throws Exception {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        ApiResponse<Void> body = ApiResponse.fail(40101, "未登录或登录已过期");
        response.getWriter().write(new ObjectMapper().writeValueAsString(body));
        return false;
    }
}
