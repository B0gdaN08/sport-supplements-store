package com.sportsupps.store.model;

import lombok.*;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;
    private Integer stock;
    private Integer categoryId;
    private String brand;
    private Integer weight;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "product_flavors", joinColumns = @JoinColumn(name = "product_id"))
    @Column(name = "flavor")
    private List<String> flavors= new ArrayList<>();

    private String imageUrl;
    private String createdAt;
}
