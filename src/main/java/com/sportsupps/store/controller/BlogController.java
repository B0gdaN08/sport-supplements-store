package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Blog;
import com.sportsupps.store.service.BlogService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService service;

    public BlogController(BlogService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> getAll() {
        var list = service.findAll();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(b -> ResponseEntity.ok(ApiResponse.ok(b)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id + " not found.")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String title = (String) body.get("title");
        if (title == null || title.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"title\" is required."));
        if (!body.containsKey("description"))
            return ResponseEntity.badRequest().body(ApiResponse.error("\"description\" is required."));

        Blog b = Blog.builder()
                .title(title.trim())
                .description((String) body.get("description"))
                .imageUrl((String) body.getOrDefault("imageUrl", ""))
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.save(b)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(b -> {
            String title = (String) body.get("title");
            if (title == null || title.trim().isEmpty())
                return ResponseEntity.badRequest().body(ApiResponse.error("\"title\" is required."));
            String description = (String) body.get("description");
            if (description == null || description.trim().isEmpty())
                return ResponseEntity.badRequest().body(ApiResponse.error("\"description\" is required."));
            b.setTitle(title.trim());
            b.setDescription(description.trim());
            b.setImageUrl(body.containsKey("imageUrl") ? (String) body.get("imageUrl") : "");
            return ResponseEntity.ok(ApiResponse.ok(service.save(b)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id + " not found.")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(b -> {
            if (body.containsKey("title"))       { String v = (String) body.get("title");       if (v != null && !v.trim().isEmpty()) b.setTitle(v.trim()); }
            if (body.containsKey("description")) { String v = (String) body.get("description"); if (v != null && !v.trim().isEmpty()) b.setDescription(v.trim()); }
            if (body.containsKey("imageUrl"))    b.setImageUrl((String) body.get("imageUrl"));
            return ResponseEntity.ok(ApiResponse.ok(service.save(b)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id + " not found.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!service.deleteById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id + " not found."));
        return ResponseEntity.ok(ApiResponse.deleted("Blog #" + id + " deleted."));
    }
}
