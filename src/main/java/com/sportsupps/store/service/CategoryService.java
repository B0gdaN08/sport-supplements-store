package com.sportsupps.store.service;

import com.sportsupps.store.model.Category;
import com.sportsupps.store.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public List<Category> findAll() {
        return repo.findAll();
    }

    public Optional<Category> findById(Integer id) {
        return repo.findById(id);
    }

    public Category save(Category category) {
        if (category.getCreatedAt() == null) {
            category.setCreatedAt(Instant.now().toString());
        }
        return repo.save(category);
    }

    public boolean deleteById(Integer id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
