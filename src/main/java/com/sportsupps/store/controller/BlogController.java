package com.sportsupps.store.controller;

import com.sportsupps.store.dto.ApiResponse;
import com.sportsupps.store.model.Blog;
import com.sportsupps.store.repository.BlogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

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

       if(!body.containsKey("imageUrl")){
            Blog b= Blog.builder().title(title.trim()).description((String) body.get("description")).build();
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(b)));
       }else{
           Blog b= Blog.builder().title(title.trim()).description((String) body.get("description")).imageUrl((String) body.get("imageUrl")).build();
           return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(repo.save(b)));
       }
    }

    @PutMapping("/{id}")

    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Map<String, Object> body) {
        Optional<Blog> opt= repo.findById(id);
        if(opt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id +"not found"));
        String title= (String) body.get("title");
        if(title == null || title.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"title\" is required."));
        String description = (String) body.get("description");
        if(description == null || description.trim().isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("\"description\" is required"));

        Blog b = opt.get();
        b.setTitle(title.trim());
        b.setDescription(description.trim());
        b.setImageUrl(body.containsKey("imageUrl")? (String) body.get("imageUrl"): "");
        return ResponseEntity.ok(ApiResponse.ok(repo.save(b)));
    }

    @PatchMapping("/{id}")

    public ResponseEntity<?> patch(@PathVariable Integer id, @RequestBody Map<String, Object> body){
        Optional<Blog> opt= repo.findById(id);
        if(opt.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id +"not found"));
        Blog b= opt.get();
        if(body.containsKey("title")){
            String title= (String) body.get("title");
            if(title != null && !title.trim().isEmpty())
                b.setTitle(title.trim());
        }
        if(body.containsKey("description")){
            String description= (String) body.get("description");
            if(description != null && !description.trim().isEmpty())
                b.setDescription(description.trim());
        }
        if(body.containsKey("imageUrl")){
            b.setImageUrl((String) body.get("imageUrl"));
        }
        return ResponseEntity.ok(ApiResponse.ok(repo.save(b)));
    }


    @DeleteMapping("/{id}")

    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if(!repo.deleteById(id)){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ApiResponse.error("Blog #" + id +"not found."));
        }
        return ResponseEntity.ok(ApiResponse.deleted("Blog #" + id+ "deleted."));
    }


}
