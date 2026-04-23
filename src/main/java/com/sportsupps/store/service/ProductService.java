package com.sportsupps.store.service;

import com.sportsupps.store.model.Product;
import com.sportsupps.store.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> findAll(Integer categoryId) {
        if (categoryId != null) return repo.findByCategoryId(categoryId);
        return repo.findAll();
    }

    public Optional<Product> findById(Integer id) {
        return repo.findById(id);
    }

    public Product save(Product product) {
        if (product.getCreatedAt() == null) {
            product.setCreatedAt(Instant.now().toString());
        }
        return repo.save(product);
    }

    public boolean deleteById(Integer id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }
}
