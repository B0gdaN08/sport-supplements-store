package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Product;
import com.sportsupps.store.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository repo;

    public ProductController(ProductRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) Integer categoryId) {
        var list = repo.findAll(categoryId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return repo.findById(id)
                .map(p -> ResponseEntity.ok(ApiResponse.ok(p)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found.")));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String name = (String) body.get("name");
        if (name == null || name.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"name\" is required."));
        if (!body.containsKey("price"))
            return ResponseEntity.badRequest().body(ApiResponse.error("\"price\" is required."));
        if (!body.containsKey("categoryId"))
            return ResponseEntity.badRequest().body(ApiResponse.error("\"categoryId\" is required."));

        Product p = buildProduct(null, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(p)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Product> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found."));
        Product p = buildProduct(opt.get(), body);
        p.setId(id);
        p.setCreatedAt(opt.get().getCreatedAt());
        return ResponseEntity.ok(ApiResponse.ok(repo.save(p)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Product> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found."));
        Product p = opt.get();
        if (body.containsKey("name"))        p.setName(((String) body.get("name")).trim());
        if (body.containsKey("description")) p.setDescription((String) body.get("description"));
        if (body.containsKey("price"))       p.setPrice(toDouble(body.get("price")));
        if (body.containsKey("stock"))       p.setStock(toInt(body.get("stock")));
        if (body.containsKey("categoryId"))  p.setCategoryId(toInt(body.get("categoryId")));
        if (body.containsKey("brand"))       p.setBrand((String) body.get("brand"));
        if (body.containsKey("weight"))      p.setWeight(toInt(body.get("weight")));
        if (body.containsKey("flavors"))     p.setFlavors(toStringList(body.get("flavors")));
        if (body.containsKey("imageUrl"))    p.setImageUrl((String) body.get("imageUrl"));
        return ResponseEntity.ok(ApiResponse.ok(repo.save(p)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.deleteById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found."));
        return ResponseEntity.ok(ApiResponse.deleted("Product #" + id + " deleted."));
    }

    private Product buildProduct(Product existing, Map<String, Object> body) {
        Product p = existing != null ? existing : new Product();
        if (body.containsKey("name"))        p.setName(((String) body.get("name")).trim());
        if (body.containsKey("description")) p.setDescription((String) body.get("description"));
        if (body.containsKey("price"))       p.setPrice(toDouble(body.get("price")));
        if (body.containsKey("stock"))       p.setStock(toInt(body.get("stock")));
        if (body.containsKey("categoryId"))  p.setCategoryId(toInt(body.get("categoryId")));
        if (body.containsKey("brand"))       p.setBrand((String) body.get("brand"));
        if (body.containsKey("weight"))      p.setWeight(toInt(body.get("weight")));
        if (body.containsKey("flavors"))     p.setFlavors(toStringList(body.get("flavors")));
        if (body.containsKey("imageUrl"))    p.setImageUrl((String) body.get("imageUrl"));
        return p;
    }

    private Double toDouble(Object v) {
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(v.toString());
    }

    private Integer toInt(Object v) {
        if (v instanceof Number n) return n.intValue();
        return Integer.parseInt(v.toString());
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object v) {
        if (v instanceof List) return (List<String>) v;
        return List.of(v.toString().split(",\\s*"));
    }
}
