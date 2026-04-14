package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.dto.LoginRequest;
import com.sportsupps.store.dto.RegisterRequest;
import com.sportsupps.store.model.User;
import com.sportsupps.store.repository.UserRepository;
import com.sportsupps.store.security.AuthUser;
import com.sportsupps.store.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepo;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepo, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        if (req.getUsername() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and password are required."));
        }
        Optional<User> opt = userRepo.findByUsername(req.getUsername().trim());
        if (opt.isEmpty() || !opt.get().getPassword().equals(req.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Invalid credentials."));
        }
        User u = opt.get();
        String token = jwtUtil.generateToken(u.getId(), u.getUsername(), u.getName(), u.getRole());
        Map<String, Object> payload = Map.of("id", u.getId(), "username", u.getUsername(),
                "name", u.getName(), "role", u.getRole());
        return ResponseEntity.ok(ApiResponse.builder().success(true).token(token).user(payload).build());
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().length() < 3)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters."));
        if (req.getPassword() == null || req.getPassword().length() < 4)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters."));
        if (req.getName() == null || req.getName().trim().length() < 2)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters."));
        if (userRepo.findByUsername(req.getUsername().trim()).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Username \"" + req.getUsername().trim() + "\" is already taken."));

        User newUser = User.builder()
                .username(req.getUsername().trim()).password(req.getPassword())
                .name(req.getName().trim()).role("user")
                .avatarUrl(req.getAvatarUrl() != null ? req.getAvatarUrl() : "")
                .build();
        newUser = userRepo.save(newUser);
        String token = jwtUtil.generateToken(newUser.getId(), newUser.getUsername(), newUser.getName(), newUser.getRole());
        Map<String, Object> payload = Map.of("id", newUser.getId(), "username", newUser.getUsername(),
                "name", newUser.getName(), "role", newUser.getRole());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.builder().success(true).token(token).user(payload).build());
    }

    // GET /api/auth/me
    @GetMapping("/me")
    public ResponseEntity<?> me(@AuthenticationPrincipal AuthUser authUser) {
        Optional<User> opt = userRepo.findById(authUser.getId());
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User not found."));
        User u = opt.get();
        Map<String, Object> pub = new HashMap<>();
        pub.put("id", u.getId()); pub.put("username", u.getUsername()); pub.put("name", u.getName());
        pub.put("role", u.getRole()); pub.put("avatarUrl", u.getAvatarUrl()); pub.put("createdAt", u.getCreatedAt());
        return ResponseEntity.ok(ApiResponse.builder().success(true).user(pub).build());
    }

    // GET /api/auth/users (admin only — secured in SecurityConfig)
    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        List<Map<String, Object>> users = userRepo.findAll().stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId()); m.put("username", u.getUsername());
                    m.put("name", u.getName()); m.put("role", u.getRole());
                    m.put("avatarUrl", u.getAvatarUrl()); m.put("createdAt", u.getCreatedAt());
                    return m;
                }).toList();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(users.size()).data(users).build());
    }

    // PUT /api/auth/users/{id} (admin only)
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found."));
        User u = opt.get();

        String name     = body.containsKey("name")     ? (String) body.get("name")     : u.getName();
        String username = body.containsKey("username") ? (String) body.get("username") : u.getUsername();
        String password = body.containsKey("password") ? (String) body.get("password") : u.getPassword();
        String role     = body.containsKey("role")     ? (String) body.get("role")     : u.getRole();
        String avatar   = body.containsKey("avatarUrl")? (String) body.get("avatarUrl"): u.getAvatarUrl();

        if (name != null && name.trim().length() < 2)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters."));
        if (username != null && username.trim().length() < 3)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters."));
        if (password != null && password.length() < 4)
            return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters."));
        if (role != null && !role.equals("admin") && !role.equals("user"))
            return ResponseEntity.badRequest().body(ApiResponse.error("\"role\" must be \"admin\" or \"user\"."));

        if (!username.equals(u.getUsername()) && userRepo.findByUsername(username).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Username \"" + username + "\" is already taken."));

        u.setName(name.trim()); u.setUsername(username.trim()); u.setPassword(password);
        u.setRole(role); u.setAvatarUrl(avatar != null ? avatar : "");
        User saved = userRepo.save(u);
        return ResponseEntity.ok(ApiResponse.ok(toPublicUser(saved)));
    }

    // PATCH /api/auth/users/{id} (admin or own profile)
    @PatchMapping("/users/{id}")
    public ResponseEntity<?> patchUser(@PathVariable Integer id,
                                       @RequestBody Map<String, Object> body,
                                       @AuthenticationPrincipal AuthUser authUser) {
        Optional<User> opt = userRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found."));

        if (!authUser.isAdmin() && !authUser.getId().equals(id))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(ApiResponse.error("You can only edit your own profile."));

        if (!authUser.isAdmin()) body.remove("role");

        User u = opt.get();
        if (body.containsKey("name"))      { String v = ((String) body.get("name")).trim();     if (v.length() < 2) return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" must be at least 2 characters.")); u.setName(v); }
        if (body.containsKey("username"))  { String v = ((String) body.get("username")).trim(); if (v.length() < 3) return ResponseEntity.badRequest().body(ApiResponse.error("\"username\" must be at least 3 characters.")); if (!v.equals(u.getUsername()) && userRepo.findByUsername(v).isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body(ApiResponse.error("Username \"" + v + "\" is already taken.")); u.setUsername(v); }
        if (body.containsKey("password"))  { String v = (String) body.get("password"); if (v.length() < 4) return ResponseEntity.badRequest().body(ApiResponse.error("\"password\" must be at least 4 characters.")); u.setPassword(v); }
        if (body.containsKey("role"))      { String v = (String) body.get("role"); if (!v.equals("admin") && !v.equals("user")) return ResponseEntity.badRequest().body(ApiResponse.error("\"role\" must be \"admin\" or \"user\".")); u.setRole(v); }
        if (body.containsKey("avatarUrl")) { u.setAvatarUrl((String) body.get("avatarUrl")); }

        return ResponseEntity.ok(ApiResponse.ok(toPublicUser(userRepo.save(u))));
    }

    // DELETE /api/auth/users/{id} (admin only)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id, @AuthenticationPrincipal AuthUser authUser) {
        if (!userRepo.findById(id).isPresent())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("User #" + id + " not found."));
        if (authUser.getId().equals(id))
            return ResponseEntity.badRequest().body(ApiResponse.error("You cannot delete your own account."));
        userRepo.deleteById(id);
        return ResponseEntity.ok(ApiResponse.deleted("User #" + id + " deleted."));
    }

    private Map<String, Object> toPublicUser(User u) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", u.getId()); m.put("username", u.getUsername()); m.put("name", u.getName());
        m.put("role", u.getRole()); m.put("avatarUrl", u.getAvatarUrl()); m.put("createdAt", u.getCreatedAt());
        return m;
    }
}
