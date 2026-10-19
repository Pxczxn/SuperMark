package com.supermark.security;

public class UserContext {
    private static final ThreadLocal<LoginUser> CURRENT = new ThreadLocal<>();

    public static void set(LoginUser u) { CURRENT.set(u); }

    public static LoginUser get() { return CURRENT.get(); }

    public static Long getUserId() {
        LoginUser u = CURRENT.get();
        return u == null ? null : u.id();
    }

    public static String getRole() {
        LoginUser u = CURRENT.get();
        return u == null ? null : u.role();
    }

    public static boolean isAdmin() {
        return "ADMIN".equals(getRole());
    }

    public static void clear() { CURRENT.remove(); }
}
