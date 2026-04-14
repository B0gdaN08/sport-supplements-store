package com.sportsupps.store.repository;

import com.sportsupps.store.model.Product;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Repository
public class ProductRepository {

    private final Map<Integer, Product> store = new LinkedHashMap<>();
    private final AtomicInteger nextId = new AtomicInteger(25);

    public ProductRepository() {
        // Protein (1)
        add(1,  "Whey Protein Gold Standard",   "Premium whey protein isolate with 24g of protein per serving.",              59.99, 150, 1, "Optimum Nutrition", 907,  List.of("Chocolate","Vanilla","Strawberry"),                   "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop", "2024-01-15");
        add(2,  "Plant Protein Vegan Blend",     "Complete plant-based protein from pea, rice and hemp. 20g per serving.",    44.99,  80, 1, "MyProtein",         1000, List.of("Natural","Chocolate","Vanilla"),                       "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop", "2024-01-20");
        add(3,  "Casein Slow-Release Protein",   "Micellar casein for overnight recovery. Releases amino acids over 7 hours.", 52.99,  65, 1, "Dymatize",           907,  List.of("Cookies & Cream","Vanilla"),                          "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop", "2024-01-25");
        // Creatine (2)
        add(4,  "Creatine Monohydrate Pure",     "Micronized creatine monohydrate for maximum absorption. 5g per serving.",   19.99, 200, 2, "Bulk Powders",       500,  List.of("Unflavored"),                                         "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", "2024-02-01");
        add(5,  "Creatine HCL Advanced",         "Creatine hydrochloride for superior solubility with no bloating.",          29.99,  90, 2, "Scitec",             300,  List.of("Fruit Punch","Watermelon"),                           "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "2024-02-10");
        // Pre-Workout (3)
        add(6,  "Pre-Workout Explosion",         "Intense energy matrix with caffeine, beta-alanine and citrulline.",         34.99,  60, 3, "MuscleTech",         300,  List.of("Blue Raspberry","Watermelon","Green Apple"),          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", "2024-03-01");
        add(7,  "Clean Energy Pre-Workout",      "Natural caffeine from green tea with adaptogens for sustained energy.",     39.99,  45, 3, "Transparent Labs",   250,  List.of("Lemon Lime","Orange"),                                "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop", "2024-03-15");
        add(8,  "Stim-Free Pre-Workout",         "Caffeine-free formula with pump-enhancing nitrates and nootropics.",        37.99,  35, 3, "Legion",             280,  List.of("Grape","Strawberry Kiwi"),                            "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=300&fit=crop", "2024-03-20");
        // BCAA (4)
        add(9,  "BCAA 2:1:1 Instantized",        "BCAAs in the optimal 2:1:1 ratio. Prevents catabolism during training.",    24.99, 120, 4, "Scitec",             400,  List.of("Tropical","Cola","Unflavored"),                       "https://images.unsplash.com/photo-1546519638405-a9f5d37a6a2e?w=400&h=300&fit=crop", "2024-04-01");
        add(10, "EAA Essential Amino Matrix",     "All 9 essential amino acids for complete muscle protein synthesis.",        32.99,  75, 4, "Kaged Muscle",       350,  List.of("Cherry Limeade","Watermelon"),                        "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop", "2024-04-10");
        add(11, "L-Glutamine Recovery",           "Pure L-glutamine to support gut health, immunity and muscle recovery.",     17.99, 180, 4, "NOW Sports",         500,  List.of("Unflavored"),                                         "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop", "2024-04-15");
        // Vitamins (5)
        add(12, "Athlete Multivitamin Complex",   "25+ vitamins and minerals tailored for high-performance athletes.",         22.99, 200, 5, "Optimum Nutrition",  150,  List.of("Tablets"),                                            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop", "2024-05-01");
        add(13, "Vitamin D3 + K2 5000 IU",        "High-potency D3 combined with K2 MK-7 for bone health and immunity.",      14.99, 300, 5, "Life Extension",      50,  List.of("Softgels"),                                           "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop", "2024-05-10");
        add(14, "Omega-3 Fish Oil Triple Strength","3000mg of EPA and DHA per serving for heart, brain and joint health.",     18.99, 160, 5, "Nordic Naturals",    120,  List.of("Lemon","Unflavored"),                                 "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop", "2024-05-15");
        // Fat Burners (6)
        add(15, "Thermogenic Fat Burner X",       "Green tea, caffeine and CLA blend to maximize fat oxidation.",              42.99,  55, 6, "MuscleTech",         180,  List.of("Capsules"),                                           "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop", "2024-06-01");
        add(16, "L-Carnitine 3000 Liquid",         "Liquid L-Carnitine for fat transport during cardio sessions.",              26.99,  80, 6, "Scitec",             500,  List.of("Tropical","Cherry"),                                  "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&h=300&fit=crop", "2024-06-15");
        // Mass Gainers (7)
        add(17, "Serious Mass 12 lbs",            "1250 calories per serving with 50g protein for extreme muscle growth.",     79.99,  40, 7, "Optimum Nutrition", 5443, List.of("Chocolate","Vanilla","Banana"),                       "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=300&fit=crop", "2024-07-01");
        add(18, "True Mass 1200",                  "215g carbs and 50g protein per serving for hard gainers.",                  69.99,  30, 7, "BSN",               4730, List.of("Chocolate Milkshake","Cookies & Cream"),               "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop", "2024-07-10");
        // Recovery (8)
        add(19, "ZMA Sleep & Recovery",           "Zinc, magnesium and B6 for deep sleep and muscle recovery.",                21.99, 130, 8, "NOW Sports",          90,  List.of("Capsules"),                                           "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=300&fit=crop", "2024-08-01");
        add(20, "Electrolyte Recovery Drink",     "Sodium, potassium, magnesium and coconut water for rapid rehydration.",     28.99, 100, 8, "Nuun",               360,  List.of("Lemon Ginger","Berry","Orange"),                      "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=300&fit=crop", "2024-08-10");
        add(21, "Collagen Peptides Sport",         "Hydrolyzed collagen peptides for joint health and tendon strength.",        35.99,  85, 8, "Vital Proteins",     567,  List.of("Unflavored","Vanilla Coconut"),                       "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400&h=300&fit=crop", "2024-08-20");
        add(22, "Tart Cherry Extract",             "Natural anti-inflammatory to reduce DOMS and speed recovery.",              19.99, 110, 8, "Swanson",            120,  List.of("Capsules"),                                           "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=400&h=300&fit=crop", "2024-08-25");
        // Extra Protein
        add(23, "Whey Isolate CFM 90%",           "Cross-flow micro-filtered whey isolate. 90% protein, zero lactose.",        74.99,  50, 1, "Scitec",             900,  List.of("White Chocolate","Pistachio","Chocolate"),            "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&h=300&fit=crop", "2024-09-01");
        add(24, "Protein Bar Box (12 units)",      "High-protein bars with 20g protein, low sugar and real chocolate coating.", 29.99, 200, 1, "Quest",              600,  List.of("Cookies & Cream","Birthday Cake","Chocolate Brownie"), "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop", "2024-09-10");
    }

    private void add(int id, String name, String desc, double price, int stock, int catId,
                     String brand, int weight, List<String> flavors, String img, String dateStr) {
        store.put(id, Product.builder().id(id).name(name).description(desc).price(price)
                .stock(stock).categoryId(catId).brand(brand).weight(weight).flavors(flavors)
                .imageUrl(img).createdAt(dateStr + "T00:00:00.000Z").build());
    }

    public List<Product> findAll(Integer categoryId) {
        return store.values().stream()
                .filter(p -> categoryId == null || p.getCategoryId().equals(categoryId))
                .collect(Collectors.toList());
    }

    public Optional<Product> findById(Integer id) { return Optional.ofNullable(store.get(id)); }

    public Product save(Product p) {
        if (p.getId() == null) {
            p.setId(nextId.getAndIncrement());
            p.setCreatedAt(Instant.now().toString());
        }
        store.put(p.getId(), p);
        return p;
    }

    public boolean deleteById(Integer id) { return store.remove(id) != null; }
}
