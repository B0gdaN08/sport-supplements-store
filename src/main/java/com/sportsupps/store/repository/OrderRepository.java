package com.sportsupps.store.repository;

import com.sportsupps.store.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);
    List<Order> findByStatus(String status);
    List<Order> findByUserIdAndStatus(Integer userId, String status);
}
