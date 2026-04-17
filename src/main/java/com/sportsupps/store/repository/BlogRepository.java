package com.sportsupps.store.repository;

import com.sportsupps.store.model.Blog;
import org.springframework.stereotype.Repository;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class BlogRepository {
    private final Map<Integer, Blog> blogs= new LinkedHashMap<>();
    private final AtomicInteger nextId= new AtomicInteger(3);

    public BlogRepository(){

    }

    private void add(Integer id,String title, String description,String imageUrl ){
        blogs.put(id, Blog.builder().id(id).title(title).description(description).imageUrl(imageUrl).build());
    }
}
