package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Product;
import com.sportsupps.store.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) Integer categoryId) {
        var list = service.findAll(categoryId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        return service.findById(id)
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
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.save(p)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(existing -> {
            Product p = buildProduct(existing, body);
            p.setId(id);
            p.setCreatedAt(existing.getCreatedAt());
            return ResponseEntity.ok(ApiResponse.ok(service.save(p)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found.")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(p -> {
            if (body.containsKey("name"))        p.setName(((String) body.get("name")).trim());
            if (body.containsKey("description")) p.setDescription((String) body.get("description"));
            if (body.containsKey("price"))       p.setPrice(toDouble(body.get("price")));
            if (body.containsKey("stock"))       p.setStock(toInt(body.get("stock")));
            if (body.containsKey("categoryId"))  p.setCategoryId(toInt(body.get("categoryId")));
            if (body.containsKey("brand"))       p.setBrand((String) body.get("brand"));
            if (body.containsKey("weight"))      p.setWeight(toInt(body.get("weight")));
            if (body.containsKey("flavors"))     p.setFlavors(toStringList(body.get("flavors")));
            if (body.containsKey("imageUrl"))    p.setImageUrl((String) body.get("imageUrl"));
            return ResponseEntity.ok(ApiResponse.ok(service.save(p)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Product #" + id + " not found.")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!service.deleteById(id))
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
        if (v instanceof List) return new ArrayList<>((List<String>) v);
        return new ArrayList<>(List.of(v.toString().split(",\\s*")));
    }
}
