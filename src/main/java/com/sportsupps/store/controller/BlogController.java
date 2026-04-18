package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Blog;
import com.sportsupps.store.repository.BlogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogRepository repo;

    public BlogController(BlogRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<?> getAll() {
        var list= repo.findAll();
        return ResponseEntity.ok(ApiResponse.builder().success(true).count(list.size()).data(list).build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id){
        return repo.findById(id).map(b -> ResponseEntity.ok(ApiResponse.ok(b)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id +"not found")));
    }

    @PostMapping

    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        String title= (String) body.get("title");
        if (title == null || title.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"title\" is required."));
        if(!body.containsKey("description"))
            return ResponseEntity.badRequest().body(ApiResponse.error("\"description\" is required"));

       if(body.containsKey("imageUrl")){
            Blog b= Blog.builder().title(body.get("title").toString()).description(body.get("description").toString()).build();
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(b)));
       }else{
           Blog b= Blog.builder().title(body.get("title").toString()).description(body.get("description").toString()).imageUrl(body.get("imageUrl").toString()).build();
           return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(b)));
       }
    }


}
