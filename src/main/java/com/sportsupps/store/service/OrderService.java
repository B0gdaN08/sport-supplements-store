package com.sportsupps.store.service;

import com.sportsupps.store.model.Order;
import com.sportsupps.store.model.OrderItem;
import com.sportsupps.store.model.Product;
import com.sportsupps.store.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository repo;
    private final ProductService productService;

    public OrderService(OrderRepository repo, ProductService productService) {
        this.repo = repo;
        this.productService = productService;
    }

    public List<Order> findAll(String status, Integer userId) {
        if (userId != null && status != null) return repo.findByUserIdAndStatus(userId, status);
        if (userId != null) return repo.findByUserId(userId);
        if (status != null) return repo.findByStatus(status);
        return repo.findAll();
    }

    public Optional<Order> findById(Integer id) {
        return repo.findById(id);
    }

    @Transactional
    public Order create(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = productService.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product #" + item.getProductId() + " not found."));
            if (product.getStock() != null && product.getStock() < item.getQuantity())
                throw new IllegalStateException("Not enough stock for \"" + product.getName() + "\". Available: " + product.getStock() + ".");
        }

        order.setCreatedAt(Instant.now().toString());
        Order saved = repo.save(order);

        for (OrderItem item : order.getItems()) {
            productService.findById(item.getProductId()).ifPresent(product -> {
                if (product.getStock() != null) {
                    product.setStock(product.getStock() - item.getQuantity());
                    productService.save(product);
                }
            });
        }

        return saved;
    }

    public Order update(Order order) {
        Optional<Order> oldOpt = repo.findById(order.getId());

        if (oldOpt.isPresent()) {
            Order oldOrder = oldOpt.get();

            boolean wasCancelled = "cancelled".equals(oldOrder.getStatus());
            boolean nowCancelled = "cancelled".equals(order.getStatus());

            // If is canceled → restore stock
            if (!wasCancelled && nowCancelled) {
                restoreStock(oldOrder);
            }

            // Update the real object
            oldOrder.setStatus(order.getStatus());
            oldOrder.setCustomerName(order.getCustomerName());
            oldOrder.setCustomerEmail(order.getCustomerEmail());
            oldOrder.setShippingAddress(order.getShippingAddress());
            oldOrder.setNotes(order.getNotes());

            return repo.save(oldOrder);
        }

        return repo.save(order);
    }

    public boolean deleteById(Integer id) {
        Optional<Order> opt = repo.findById(id);
        if (opt.isEmpty()) return false;
        Order order = opt.get();
        // If was cenceled the order, yet is restored the stock
        if (!"cancelled".equals(order.getStatus())) {
            restoreStock(order);
        }
        repo.deleteById(id);
        return true;
    }

    public void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            productService.findById(item.getProductId()).ifPresent(product -> {
                if (product.getStock() != null) {
                    product.setStock(product.getStock() + item.getQuantity());
                    productService.save(product);
                }
            });
        }
    }
    public void reduceStock(Order order) {
        for (OrderItem item : order.getItems()) {
            productService.findById(item.getProductId()).ifPresent(product -> {
                if (product.getStock() != null) {
                    product.setStock(product.getStock() - item.getQuantity());
                    productService.save(product);
                }
            });
        }
    }
}
