package com.sportsupps.store.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    private Integer id;
    private Integer userId;
    private String customerName;
    private String customerEmail;
    private List<OrderItem> items;
    private String status;
    private Double total;
    private String shippingAddress;
    private String notes;
    private String createdAt;
}
