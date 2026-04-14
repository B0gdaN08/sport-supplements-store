package com.sportsupps.store.repository;

import com.sportsupps.store.model.Order;
import com.sportsupps.store.model.OrderItem;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Repository
public class OrderRepository {

    private final Map<Integer, Order> store = new LinkedHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(4);

    public OrderRepository() {
        store.put(1, Order.builder().id(1).userId(null)
                .customerName("Carlos García").customerEmail("carlos.garcia@email.com")
                .items(List.of(new OrderItem(1, 2, 59.99), new OrderItem(3, 1, 19.99)))
                .status("delivered").total(139.97)
                .shippingAddress("Calle Mayor 15, 28001 Madrid, Spain")
                .notes("Please leave at the door").createdAt("2024-03-01T00:00:00.000Z").build());
        store.put(2, Order.builder().id(2).userId(null)
                .customerName("Laura Martínez").customerEmail("laura.martinez@email.com")
                .items(List.of(new OrderItem(5, 1, 34.99), new OrderItem(2, 1, 44.99)))
                .status("shipped").total(79.98)
                .shippingAddress("Avenida Diagonal 200, 08013 Barcelona, Spain")
                .notes("").createdAt("2024-03-10T00:00:00.000Z").build());
        store.put(3, Order.builder().id(3).userId(null)
                .customerName("Miguel Torres").customerEmail("miguel.torres@email.com")
                .items(List.of(new OrderItem(4, 2, 29.99)))
                .status("pending").total(59.98)
                .shippingAddress("Plaza España 1, 41001 Sevilla, Spain")
                .notes("Call before delivery").createdAt("2024-03-20T00:00:00.000Z").build());
    }

    public List<Order> findAll(String status, Integer userId) {
        return store.values().stream()
                .filter(o -> status == null || o.getStatus().equals(status))
                .filter(o -> userId == null || userId.equals(o.getUserId()))
                .collect(Collectors.toList());
    }

    public Optional<Order> findById(Integer id) { return Optional.ofNullable(store.get(id)); }

    public Order save(Order o) {
        if (o.getId() == null) {
            o.setId(nextId.getAndIncrement());
            o.setCreatedAt(Instant.now().toString());
        }
        store.put(o.getId(), o);
        return o;
    }

    public boolean deleteById(Integer id) { return store.remove(id) != null; }
}
