package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Category;
import com.sportsupps.store.service.CategoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> getAll() {
        var list = service.findAll();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return service.findById(id)
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
                .name(name.trim()).slug(slug)
                .description((String) body.getOrDefault("description", ""))
                .icon((String) body.getOrDefault("icon", "📦"))
                .imageUrl((String) body.getOrDefault("imageUrl", ""))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.save(c)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(c -> {
            String name = (String) body.get("name");
            if (name == null || name.trim().isEmpty())
                return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" is required."));
            c.setName(name.trim());
            c.setSlug(body.containsKey("slug") ? (String) body.get("slug") : name.toLowerCase().replaceAll("\\s+", "-"));
            c.setDescription((String) body.getOrDefault("description", ""));
            c.setIcon(body.containsKey("icon") ? (String) body.get("icon") : c.getIcon());
            c.setImageUrl(body.containsKey("imageUrl") ? (String) body.get("imageUrl") : c.getImageUrl());
            return ResponseEntity.ok(ApiResponse.ok(service.save(c)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found.")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(c -> {
            if (body.containsKey("name"))        c.setName(((String) body.get("name")).trim());
            if (body.containsKey("slug"))        c.setSlug((String) body.get("slug"));
            if (body.containsKey("description")) c.setDescription((String) body.get("description"));
            if (body.containsKey("icon"))        c.setIcon((String) body.get("icon"));
            if (body.containsKey("imageUrl"))    c.setImageUrl((String) body.get("imageUrl"));
            return ResponseEntity.ok(ApiResponse.ok(service.save(c)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!service.deleteById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Category #" + id + " not found."));
        return ResponseEntity.ok(ApiResponse.deleted("Category #" + id + " deleted."));
    }
}
