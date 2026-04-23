package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.dto.LoginRequest;
import com.sportsupps.store.dto.RegisterRequest;
import com.sportsupps.store.model.User;
import com.sportsupps.store.security.AuthUser;
import com.sportsupps.store.security.JwtUtil;
import com.sportsupps.store.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.getUsername() == null || req.getPassword() == null)
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and password are required."));
        return userService.findByUsername(req.getUsername().trim())
                .filter(u -> u.getPassword().equals(req.getPassword()))
                .map(u -> {
                    String token = jwtUtil.generateToken(u.getId(), u.getUsername(), u.getName(), u.getRole());
                    Map<String, Object> payload = Map.of("id", u.getId(), "username", u.getUsername(), "name", u.getName(), "role", u.getRole());
                    return ResponseEntity.ok(ApiResponse.builder().success(true).token(token).user(payload).build());
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid credentials.")));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().length() < 3)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters."));
        if (req.getPassword() == null || req.getPassword().length() < 4)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters."));
        if (req.getName() == null || req.getName().trim().length() < 2)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters."));
        if (userService.existsByUsername(req.getUsername().trim()))
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Username \"" + req.getUsername().trim() + "\" is already taken."));

        User newUser = User.builder()
                .username(req.getUsername().trim()).password(req.getPassword())
                .name(req.getName().trim()).role("user")
                .avatarUrl(req.getAvatarUrl() != null ? req.getAvatarUrl() : "")
                .build();
        newUser = userService.save(newUser);
        String token = jwtUtil.generateToken(newUser.getId(), newUser.getUsername(), newUser.getName(), newUser.getRole());
        Map<String, Object> payload = Map.of("id", newUser.getId(), "username", newUser.getUsername(), "name", newUser.getName(), "role", newUser.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.builder().success(true).token(token).user(payload).build());
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal AuthUser authUser) {
        return userService.findById(authUser.getId())
                .map(u -> ResponseEntity.ok(ApiResponse.builder().success(true).user(toPublicUser(u)).build()))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found.")));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<Map<String, Object>> users = userService.findAll().stream().map(this::toPublicUser).toList();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(users.size()).data(users).build());
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return userService.findById(id).map(u -> {
            String name     = body.containsKey("name")      ? (String) body.get("name")      : u.getName();
            String username = body.containsKey("username")  ? (String) body.get("username")  : u.getUsername();
            String password = body.containsKey("password")  ? (String) body.get("password")  : u.getPassword();
            String role     = body.containsKey("role")      ? (String) body.get("role")      : u.getRole();
            String avatar   = body.containsKey("avatarUrl") ? (String) body.get("avatarUrl") : u.getAvatarUrl();

            if (name != null && name.trim().length() < 2)     return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters."));
            if (username != null && username.trim().length() < 3) return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters."));
            if (password != null && password.length() < 4)    return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters."));
            if (role != null && !role.equals("admin") && !role.equals("user")) return ResponseEntity.badRequest().body(ApiResponse.error("\"role\" must be \"admin\" or \"user\"."));
            if (!username.equals(u.getUsername()) && userService.existsByUsername(username)) return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Username \"" + username + "\" is already taken."));

            u.setName(name.trim()); u.setUsername(username.trim()); u.setPassword(password);
            u.setRole(role); u.setAvatarUrl(avatar != null ? avatar : "");
            return ResponseEntity.ok(ApiResponse.ok(toPublicUser(userService.save(u))));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found.")));
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<?> patchUser(@PathVariable Integer id, @RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal AuthUser authUser) {
        return userService.findById(id).map(u -> {
            if (!authUser.isAdmin() && !authUser.getId().equals(id))
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("You can only edit your own profile."));
            if (!authUser.isAdmin()) body.remove("role");

            if (body.containsKey("name"))      { String v = ((String) body.get("name")).trim();     if (v.length() < 2) return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters.")); u.setName(v); }
            if (body.containsKey("username"))  { String v = ((String) body.get("username")).trim(); if (v.length() < 3) return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters.")); if (!v.equals(u.getUsername()) && userService.existsByUsername(v)) return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Username \"" + v + "\" is already taken.")); u.setUsername(v); }
            if (body.containsKey("password"))  { String v = (String) body.get("password"); if (v.length() < 4) return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters.")); u.setPassword(v); }
            if (body.containsKey("role"))      { String v = (String) body.get("role"); if (!v.equals("admin") && !v.equals("user")) return ResponseEntity.badRequest().body(ApiResponse.error("\"role\" must be \"admin\" or \"user\".")); u.setRole(v); }
            if (body.containsKey("avatarUrl")) u.setAvatarUrl((String) body.get("avatarUrl"));

            return ResponseEntity.ok(ApiResponse.ok(toPublicUser(userService.save(u))));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found.")));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id, @AuthenticationPrincipal AuthUser authUser) {
        if (!userService.findById(id).isPresent())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found."));
        if (authUser.getId().equals(id))
            return ResponseEntity.badRequest().body(ApiResponse.error("You cannot delete your own account."));
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.deleted("User #" + id + " deleted."));
    }

    private Map<String, Object> toPublicUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId()); m.put("username", u.getUsername()); m.put("name", u.getName());
        m.put("role", u.getRole()); m.put("avatarUrl", u.getAvatarUrl()); m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
