package com.sportsupps.store.repository;

import com.sportsupps.store.model.Blog;
import com.sportsupps.store.model.Category;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Repository
public class BlogRepository {
    private final Map<Integer, Blog> blogs= new LinkedHashMap<>();
    private final AtomicInteger nextId= new AtomicInteger(3);

    public BlogRepository(){
        add(1,"Effects caused by the creatine on the body", "Creatine is one of the most researched and widely used supplements in sports nutrition. Naturally found in small amounts in foods like red meat and fish, and also synthesized in the liver, kidneys, and pancreas, creatine plays a fundamental role in energy production, especially during short bursts of high-intensity exercise. When taken as a supplement, it produces several notable physiological effects throughout the body.\n" +
                "\n" +
                "One of the primary effects of creatine is the increase in ATP (adenosine triphosphate) production. ATP is the main energy currency of the cell, and during intense activities such as sprinting or weightlifting, it is rapidly depleted. Creatine helps regenerate ATP by donating a phosphate group to ADP (adenosine diphosphate), quickly restoring energy levels. This allows muscles to maintain peak performance for longer periods, delaying fatigue and improving overall exercise capacity.\n" +
                "\n" +
                "Another significant effect is the enhancement of muscle strength and power. Numerous studies have shown that creatine supplementation increases maximal strength, explosive power, and repetition performance during resistance training. Over time, this leads to greater training volume and, consequently, improved muscle growth, a process known as hypertrophy. Athletes in sports like football, sprinting, and bodybuilding often use creatine specifically for this purpose.\n" +
                "\n" +
                "Creatine also causes an increase in muscle hydration and cell volume. It draws water into muscle cells, making them fuller and more voluminous. This not only contributes to a more muscular appearance but also creates a more anabolic environment within the cell, which can promote protein synthesis and reduce muscle breakdown. This osmotic effect is one of the reasons why creatine is sometimes associated with rapid initial weight gain.\n" +
                "\n" +
                "Beyond its effects on muscles, creatine has been shown to influence brain health and cognitive function. The brain also requires ATP for optimal performance, and creatine may help improve short-term memory, reduce mental fatigue, and support neurological health. Some research suggests it could be beneficial in conditions like depression, traumatic brain injury, and aging-related cognitive decline, although more studies are needed in these areas.\n" +
                "\n" +
                "Finally, creatine is generally considered safe for healthy individuals when taken at recommended doses. Common side effects, when they occur, are usually mild and may include gastrointestinal discomfort or muscle cramping, though evidence for cramping is limited. Long-term use has not been linked to serious health issues in healthy people, but those with pre-existing kidney conditions should consult a doctor before supplementation. Overall, creatine remains one of the most effective and well-tolerated supplements for improving physical performance and supporting cellular energy metabolism.\n" +
                "\n", "","2025-01-30");
        add(2,"When and How to Take Protein: A Simple Guide","Protein is essential for building and repairing muscles, but timing and method can help you get the most out of it. While your total daily intake matters most, paying attention to when and how you take protein can improve your results, especially if you exercise regularly.\n" +
                "\n" +
                "The best time to take protein is right after your workout. Within 30 to 60 minutes of exercise, your muscles are ready to absorb nutrients and begin repair. This is often called the \"anabolic window.\" A fast-digesting protein like whey is ideal at this moment to boost muscle recovery and growth. That said, you don't need to rely only on post-workout protein. Spreading your intake evenly across meals—about 20 to 40 grams per meal—helps keep your muscles fueled throughout the day. Another good time is before bed. A slow-digesting protein like casein provides a steady release of amino acids while you sleep, helping reduce muscle breakdown overnight.\n" +
                "\n" +
                "As for how to take protein, the easiest way is through shakes. Just mix protein powder with water, milk, or a plant-based drink. You can also blend it into smoothies with fruit or peanut butter for extra flavor and nutrients. If you prefer solid food, you can add protein powder to oatmeal, yogurt, pancakes, or homemade snacks. Don't forget whole food sources either—eggs, chicken, fish, Greek yogurt, and tofu are excellent options. A combination of shakes and real food usually works best for most people.\n" +
                "\n" +
                "In short, take protein after workouts, spread it throughout the day, and consider a slow-digesting option before bed. Use shakes for convenience and whole foods for variety. Stay consistent, stay hydrated, and you'll get the most out of your protein intake.\n" +
                "\n" ,"","2025-07-03");
    }

    private void add(Integer id,String title, String description,String imageUrl, String createdAt ) {
        blogs.put(id, Blog.builder().id(id).title(title).description(description).imageUrl(imageUrl).createdAt(createdAt + "T00:00:00.000Z").build());
    }

    public Optional<Blog> findById(Integer id){
        return Optional.ofNullable(blogs.get(id));
    }

    public boolean deleteById(Integer id){
        return blogs.remove(id) != null;
    }

    public Blog save(Blog b){
        if(b.getId() == null){
            b.setId(nextId.getAndIncrement());
            b.setCreatedAt(Instant.now().toString());
        }
        blogs.put(b.getId(), b);
        return b;
    }
    public List<Blog> findAll() { return new ArrayList<>(blogs.values()); }
}
