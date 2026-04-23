package com.sportsupps.store.service;

import com.sportsupps.store.model.Blog;
import com.sportsupps.store.repository.BlogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class BlogService {

    private final BlogRepository repo;

    public BlogService(BlogRepository repo) {
        this.repo = repo;
    }

    public List<Blog> findAll() {
        return repo.findAll();
    }

    public Optional<Blog> findById(Integer id) {
        return repo.findById(id);
    }

    public Blog save(Blog blog) {
        if (blog.getCreatedAt() == null) {
            blog.setCreatedAt(Instant.now().toString());
        }
        return repo.save(blog);
    }

    public boolean deleteById(Integer id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
