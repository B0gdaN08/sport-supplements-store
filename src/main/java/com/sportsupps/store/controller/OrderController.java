package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Order;
import com.sportsupps.store.model.OrderItem;
import com.sportsupps.store.model.Product;
import com.sportsupps.store.repository.OrderRepository;
import com.sportsupps.store.repository.ProductRepository;
import com.sportsupps.store.security.AuthUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final List<String> VALID_STATUSES = List.of("pending", "confirmed", "shipped", "delivered", "cancelled");

    private final OrderRepository repo;
    private final ProductRepository productRepo;

    public OrderController(OrderRepository repo, ProductRepository productRepo) {
        this.repo = repo;
        this.productRepo = productRepo;
    }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status,
                                    @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null) {
            return ResponseEntity.ok(ApiResponse.builder().success(true).count(0).data(List.of()).build());
        }
        Integer userId = authUser.isAdmin() ? null : authUser.getId();
        var list = repo.findAll(status, userId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id, @AuthenticationPrincipal AuthUser authUser) {
        if(authUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.error("Unauthorized access"));
        }
        Optional<Order> o = repo.findById(id);
        if (o.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order #" + id + " not found."));
        }
        Order order = o.get();
        Integer orderOwner = order.getUserId();

        if(!authUser.isAdmin()) {

            Integer authUserId = authUser.getId();

            if (!Objects.equals(orderOwner, authUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.error("You don't have permission to view this order."));
            }
        }
        return ResponseEntity.ok(ApiResponse.ok(order));
        /*return repo.findById(id)
                .map(o -> ResponseEntity.ok(ApiResponse.ok(o)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order #" + id + " not found.")));*/
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body,
                                    @AuthenticationPrincipal AuthUser authUser) {
        String customerName = (String) body.get("customerName");
        if (customerName == null || customerName.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"customerName\" is required."));

        List<Map<String, Object>> rawItems = (List<Map<String, Object>>) body.getOrDefault("items", List.of());
        List<OrderItem> items = rawItems.stream().map(i -> new OrderItem(
                toInt(i.get("productId")), toInt(i.get("quantity")), toDouble(i.get("unitPrice"))
        )).toList();

        for (OrderItem item : items) {
            Optional<Product> productOpt = productRepo.findById(item.getProductId());
            if (productOpt.isEmpty())
                return ResponseEntity.badRequest().body(ApiResponse.error("Product #" + item.getProductId() + " not found."));
            Product product = productOpt.get();
            if (product.getStock() != null && product.getStock() < item.getQuantity())
                return ResponseEntity.badRequest().body(ApiResponse.error(
                        "Not enough stock for \"" + product.getName() + "\". Available: " + product.getStock() + "."));
        }

        double total = items.stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum();
        total = Math.round(total * 100.0) / 100.0;

        Order o = Order.builder()
                .userId(authUser != null ? authUser.getId() : null)
                .customerName(customerName.trim())
                .customerEmail((String) body.getOrDefault("customerEmail", ""))
                .items(items).status("pending").total(total)
                .shippingAddress((String) body.getOrDefault("shippingAddress", ""))
                .notes((String) body.getOrDefault("notes", ""))
                .build();
        Order saved = repo.save(o);

        for (OrderItem item : items) {
            Optional<Product> productOpt = productRepo.findById(item.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                if (product.getStock() != null) {
                    product.setStock(product.getStock() - item.getQuantity());
                    productRepo.save(product);
                }
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Order> opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order #" + id + " not found."));
        Order o = opt.get();
        if (body.containsKey("customerName"))    o.setCustomerName((String) body.get("customerName"));
        if (body.containsKey("customerEmail"))   o.setCustomerEmail((String) body.get("customerEmail"));
        if (body.containsKey("shippingAddress")) o.setShippingAddress((String) body.get("shippingAddress"));
        if (body.containsKey("notes"))           o.setNotes((String) body.get("notes"));
        if (body.containsKey("status")) {
            String s = (String) body.get("status");
            if (!VALID_STATUSES.contains(s)) return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status."));
            o.setStatus(s);
        }
        if (body.containsKey("items")) {
            List<Map<String, Object>> rawItems = (List<Map<String, Object>>) body.get("items");
            List<OrderItem> items = rawItems.stream().map(i -> new OrderItem(toInt(i.get("productId")), toInt(i.get("quantity")), toDouble(i.get("unitPrice")))).toList();
            o.setItems(items);
            o.setTotal(Math.round(items.stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum() * 100.0) / 100.0);
        }
        return ResponseEntity.ok(ApiResponse.ok(repo.save(o)));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.deleteById(id))
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order #" + id + " not found."));
        return ResponseEntity.ok(ApiResponse.deleted("Order #" + id + " deleted."));
    }

    private Double toDouble(Object v) {
        if (v instanceof Number n) return n.doubleValue();
        return Double.parseDouble(v.toString());
    }

    private Integer toInt(Object v) {
        if (v instanceof Number n) return n.intValue();
        return Integer.parseInt(v.toString());
    }
}
