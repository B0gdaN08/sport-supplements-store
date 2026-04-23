package com.sportsupps.store.model;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "categories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon;
    private String imageUrl;
    private String createdAt;
}
