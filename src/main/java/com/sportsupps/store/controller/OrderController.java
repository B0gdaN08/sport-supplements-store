package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Order;
import com.sportsupps.store.model.OrderItem;
import com.sportsupps.store.security.AuthUser;
import com.sportsupps.store.service.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final List<String> VALID_STATUSES = List.of("pending", "confirmed", "shipped", "delivered", "cancelled");

    private final OrderService service;

    public OrderController(OrderService service) { this.service = service; }

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) String status,
                                    @AuthenticationPrincipal AuthUser authUser) {
        if (authUser == null)
            return ResponseEntity.ok(ApiResponse.builder().success(true).count(0).data(List.of()).build());
        Integer userId = authUser.isAdmin() ? null : authUser.getId();
        var list = service.findAll(status, userId);
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

   @GetMapping("/{id}")
   public ResponseEntity<?> getById(@PathVariable Integer id,
                                    @AuthenticationPrincipal AuthUser authUser) {
       return service.findById(id)
               .filter(o -> authUser.isAdmin() || o.getUserId().equals(authUser.getId()))
               .map(o -> ResponseEntity.ok(ApiResponse.ok(o)))
               .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                       .body(ApiResponse.error("Order #" + id + " not found.")));
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

        double total = items.stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum();
        total = Math.round(total * 100.0) / 100.0;

        Order order = Order.builder()
                .userId(authUser != null ? authUser.getId() : null)
                .customerName(customerName.trim())
                .customerEmail((String) body.getOrDefault("customerEmail", ""))
                .items(items).status("pending").total(total)
                .shippingAddress((String) body.getOrDefault("shippingAddress", ""))
                .notes((String) body.getOrDefault("notes", ""))
                .build();

        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(service.create(order)));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return service.findById(id).map(o -> {
            if (body.containsKey("customerName"))    o.setCustomerName((String) body.get("customerName"));
            if (body.containsKey("customerEmail"))   o.setCustomerEmail((String) body.get("customerEmail"));
            if (body.containsKey("shippingAddress")) o.setShippingAddress((String) body.get("shippingAddress"));
            if (body.containsKey("notes"))           o.setNotes((String) body.get("notes"));
            if (body.containsKey("status")) {
                String s = (String) body.get("status");
                if (!VALID_STATUSES.contains(s))
                    return ResponseEntity.badRequest().body(ApiResponse.error("Invalid status."));
                String previousStatus = o.getStatus();
                if (!"cancelled".equals(previousStatus) && "cancelled".equals(s)) {
                    service.restoreStock(o);
                }
                o.setStatus(s);
            }
            if (body.containsKey("items")) {
                List<Map<String, Object>> rawItems = (List<Map<String, Object>>) body.get("items");
                List<OrderItem> items = rawItems.stream().map(i -> new OrderItem(toInt(i.get("productId")), toInt(i.get("quantity")), toDouble(i.get("unitPrice")))).toList();
                o.setItems(items);
                o.setTotal(Math.round(items.stream().mapToDouble(i -> i.getQuantity() * i.getUnitPrice()).sum() * 100.0) / 100.0);
            }
            return ResponseEntity.ok(ApiResponse.ok(service.update(o)));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Order #" + id + " not found.")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        return update(id, body);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!service.deleteById(id))
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
