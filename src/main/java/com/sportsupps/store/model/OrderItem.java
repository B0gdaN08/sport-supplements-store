package com.sportsupps.store.model;

import lombok.*;

import javax.persistence.Embeddable;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    private Integer productId;
    private Integer quantity;
    private Double unitPrice;
}
