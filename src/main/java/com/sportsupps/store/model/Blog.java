package com.sportsupps.store.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Blog {
    private Integer id;
    private String title;
    private String description;
    @Builder.Default
    private String imageUrl="";
    @Builder.Default
    private String createdAt= LocalDateTime.now() .format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);

}
