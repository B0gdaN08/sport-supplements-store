package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Category;
import com.sportsupps.store.repository.CategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository repo;

    public CategoryController(CategoryRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<?> getAll() {
        var list = repo.findAll();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return repo.findById(id)
                .map(c -> ResponseEntity.ok(ApiResponse.ok(c)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found.")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" is required."));

        String slug = body.containsKey("slug") ? (String) body.get("slug") : name.toLowerCase().replaceAll("\\s+", "-");
        Category c = Category.builder()
                .name(name.trim()).slug(slug).description((String) body.getOrDefault("description", ""))
                .icon((String) body.getOrDefault("icon", "📦")).imageUrl((String) body.getOrDefault("imageUrl", ""))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(c)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Category> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found."));
        String name = (String) body.get("name");
        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" is required."));

        Category c = opt.get();
        c.setName(name.trim());
        c.setSlug(body.containsKey("slug") ? (String) body.get("slug") : name.toLowerCase().replaceAll("\\s+", "-"));
        c.setDescription((String) body.getOrDefault("description", ""));
        c.setIcon(body.containsKey("icon") ? (String) body.get("icon") : c.getIcon());
        c.setImageUrl(body.containsKey("imageUrl") ? (String) body.get("imageUrl") : c.getImageUrl());
        return ResponseEntity.ok(ApiResponse.ok(repo.save(c)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Category> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found."));
        Category c = opt.get();
        if (body.containsKey("name"))        c.setName(((String) body.get("name")).trim());
        if (body.containsKey("slug"))        c.setSlug((String) body.get("slug"));
        if (body.containsKey("description")) c.setDescription((String) body.get("description"));
        if (body.containsKey("icon"))        c.setIcon((String) body.get("icon"));
        if (body.containsKey("imageUrl"))    c.setImageUrl((String) body.get("imageUrl"));
        return ResponseEntity.ok(ApiResponse.ok(repo.save(c)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.deleteById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found."));
        return ResponseEntity.ok(ApiResponse.deleted("Category #" + id + " deleted."));
    }
}
