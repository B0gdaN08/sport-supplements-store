package com.sportsupps.store.repository;

import com.sportsupps.store.model.User;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class UserRepository {

    private final Map<Integer, User> store = new LinkedHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(3);

    public UserRepository() {
        String seed = "2024-01-01T00:00:00.000Z";
        store.put(1, User.builder().id(1).username("admin").password("admin123")
                .name("Administrator").role("admin").avatarUrl("").createdAt(seed).build());
        store.put(2, User.builder().id(2).username("user").password("user123")
                .name("John Doe").role("user").avatarUrl("").createdAt(seed).build());
    }

    public List<User> findAll() {
        return new ArrayList<>(store.values());
    }

    public Optional<User> findById(Integer id) {
        return Optional.ofNullable(store.get(id));
    }

    public Optional<User> findByUsername(String username) {
        return store.values().stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst();
    }

    public User save(User user) {
        if (user.getId() == null) {
            user.setId(nextId.getAndIncrement());
            user.setCreatedAt(Instant.now().toString());
        }
        store.put(user.getId(), user);
        return user;
    }

    public boolean deleteById(Integer id) {
        return store.remove(id) != null;
    }
}
