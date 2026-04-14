package com.sportsupps.store.security;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthUser {
    private Integer id;
    private String username;
    private String name;
    private String role;

    public boolean isAdmin() {
        return "admin".equals(role);
    }
}
