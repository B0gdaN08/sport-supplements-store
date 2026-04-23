package com.sportsupps.store.model;

import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String username;

    private String password;
    private String name;
    private String role;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    private String createdAt;
}
