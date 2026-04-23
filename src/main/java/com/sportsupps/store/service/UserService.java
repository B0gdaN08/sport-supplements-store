package com.sportsupps.store.service;

import com.sportsupps.store.model.User;
import com.sportsupps.store.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = repo;
    }

    public List<User> findAll() {
        return repo.findAll();
    }

    public Optional<User> findById(Integer id) {
        return repo.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return repo.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return repo.findByUsername(username).isPresent();
    }

    public User save(User user) {
        if (user.getCreatedAt() == null) {
            user.setCreatedAt(Instant.now().toString());
        }
        return repo.save(user);
    }

    public boolean deleteById(Integer id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
