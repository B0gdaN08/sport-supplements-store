package com.sportsupps.store.repository;

import com.sportsupps.store.model.Category;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class CategoryRepository {

    private final Map<Integer, Category> store = new LinkedHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(12);

    public CategoryRepository() {
        String seed = "2024-01-01T00:00:00.000Z";
        add(1, "Protein",              "protein",              "Protein supplements to support muscle growth and recovery.",             "💪", "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=200&fit=crop", seed);
        add(2, "Creatine",             "creatine",             "Creatine supplements to boost strength and power output.",               "⚡", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop", seed);
        add(3, "Pre-Workout",          "pre-workout",          "Energy and focus formulas for peak training performance.",               "🔥", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop", seed);
        add(4, "BCAA & Amino Acids",   "bcaa-amino-acids",     "Essential amino acids for muscle endurance, recovery and lean retention.","🧬", "https://images.unsplash.com/photo-1546519638405-a9f5d37a6a2e?w=400&h=200&fit=crop", seed);
        add(5, "Vitamins & Minerals",  "vitamins-minerals",    "Micronutrients and vitamin complexes to support overall health.",         "🌿", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop", seed);
        add(6, "Fat Burners",          "fat-burners",          "Thermogenic supplements to accelerate metabolism and support weight loss.","🔆", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop", seed);
        add(7, "Mass Gainers",         "mass-gainers",         "High-calorie blends for bulking and serious size gains.",                "🏋️", "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=200&fit=crop", seed);
        add(8, "Recovery",             "recovery",             "Post-workout formulas to reduce soreness and speed up muscle repair.",   "🛌", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=200&fit=crop", seed);
        add(9, "Protein Bars & Snacks","protein-bars-snacks",  "Convenient high-protein bars, cookies and snacks for on-the-go.",       "🍫", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop", seed);
        add(10,"Joint & Mobility",     "joint-mobility",       "Glucosamine, chondroitin and collagen for joint health and flexibility.","🦴", "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop", seed);
        add(11,"Hydration & Electrolytes","hydration-electrolytes","Sports drinks and electrolyte mixes for peak performance.",         "💧", "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=200&fit=crop", seed);
    }

    private void add(int id, String name, String slug, String desc, String icon, String img, String createdAt) {
        store.put(id, Category.builder().id(id).name(name).slug(slug)
                .description(desc).icon(icon).imageUrl(img).createdAt(createdAt).build());
    }

    public List<Category> findAll() { return new ArrayList<>(store.values()); }

    public Optional<Category> findById(Integer id) { return Optional.ofNullable(store.get(id)); }

    public Category save(Category c) {
        if (c.getId() == null) {
            c.setId(nextId.getAndIncrement());
            c.setCreatedAt(Instant.now().toString());
        }
        store.put(c.getId(), c);
        return c;
    }

    public boolean deleteById(Integer id) { return store.remove(id) != null; }
}
