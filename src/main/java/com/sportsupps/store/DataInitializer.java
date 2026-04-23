package com.sportsupps.store;

import com.sportsupps.store.model.*;
import com.sportsupps.store.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;
    private final UserRepository userRepo;
    private final BlogRepository blogRepo;

    public DataInitializer(CategoryRepository categoryRepo, ProductRepository productRepo,
                           UserRepository userRepo, BlogRepository blogRepo) {
        this.categoryRepo = categoryRepo;
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.blogRepo = blogRepo;
    }

    @Override
    public void run(String... args) {
        if (categoryRepo.count() == 0) initCategories();
        if (productRepo.count() == 0) initProducts();
        if (userRepo.count() == 0) initUsers();
        if (blogRepo.count() == 0) initBlogs();
    }

    private void initCategories() {
        String seed = "2024-01-01T00:00:00.000Z";
        categoryRepo.saveAll(List.of(
            cat("Protein",               "protein",               "Protein supplements to support muscle growth and recovery.",              "💪", "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=200&fit=crop", seed),
            cat("Creatine",              "creatine",              "Creatine supplements to boost strength and power output.",                "⚡", "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop", seed),
            cat("Pre-Workout",           "pre-workout",           "Energy and focus formulas for peak training performance.",               "🔥", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop", seed),
            cat("BCAA & Amino Acids",    "bcaa-amino-acids",      "Essential amino acids for muscle endurance, recovery and lean retention.","🧬", "https://images.unsplash.com/photo-1546519638405-a9f5d37a6a2e?w=400&h=200&fit=crop", seed),
            cat("Vitamins & Minerals",   "vitamins-minerals",     "Micronutrients and vitamin complexes to support overall health.",         "🌿", "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=200&fit=crop", seed),
            cat("Fat Burners",           "fat-burners",           "Thermogenic supplements to accelerate metabolism and support weight loss.","🔆", "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=200&fit=crop", seed),
            cat("Mass Gainers",          "mass-gainers",          "High-calorie blends for bulking and serious size gains.",                "🏋️", "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=200&fit=crop", seed),
            cat("Recovery",              "recovery",              "Post-workout formulas to reduce soreness and speed up muscle repair.",   "🛌", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=200&fit=crop", seed),
            cat("Protein Bars & Snacks", "protein-bars-snacks",   "Convenient high-protein bars, cookies and snacks for on-the-go.",       "🍫", "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=200&fit=crop", seed),
            cat("Joint & Mobility",      "joint-mobility",        "Glucosamine, chondroitin and collagen for joint health and flexibility.","🦴", "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=200&fit=crop", seed),
            cat("Hydration & Electrolytes","hydration-electrolytes","Sports drinks and electrolyte mixes for peak performance.",           "💧", "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=400&h=200&fit=crop", seed)
        ));
    }

    private void initProducts() {
        productRepo.saveAll(List.of(
            prod("Whey Protein Gold Standard",   "Premium whey protein isolate with 24g of protein per serving.",              59.99, 150, 1, "Optimum Nutrition", 907,  List.of("Chocolate","Vanilla","Strawberry"),                   "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=300&fit=crop",          "2024-01-15T00:00:00.000Z"),
            prod("Plant Protein Vegan Blend",    "Complete plant-based protein from pea, rice and hemp. 20g per serving.",    44.99,  80, 1, "MyProtein",         1000, List.of("Natural","Chocolate","Vanilla"),                       "https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?q=80&w=870&auto=format&fit=crop","2024-01-20T00:00:00.000Z"),
            prod("Casein Slow-Release Protein",  "Micellar casein for overnight recovery. Releases amino acids over 7 hours.", 52.99,  65, 1, "Dymatize",           907,  List.of("Cookies & Cream","Vanilla"),                          "https://images.unsplash.com/photo-1590163326027-e224f3a0983e?q=80&w=870&auto=format&fit=crop","2024-01-25T00:00:00.000Z"),
            prod("Creatine Monohydrate Pure",    "Micronized creatine monohydrate for maximum absorption. 5g per serving.",   19.99, 200, 2, "Bulk Powders",       500,  List.of("Unflavored"),                                         "https://images.unsplash.com/photo-1693996045435-af7c48b9cafb?q=80&w=870&auto=format&fit=crop","2024-02-01T00:00:00.000Z"),
            prod("Creatine HCL Advanced",        "Creatine hydrochloride for superior solubility with no bloating.",          29.99,  90, 2, "Scitec",             300,  List.of("Fruit Punch","Watermelon"),                           "https://images.unsplash.com/photo-1693996045435-af7c48b9cafb?q=80&w=870&auto=format&fit=crop","2024-02-10T00:00:00.000Z"),
            prod("Pre-Workout Explosion",        "Intense energy matrix with caffeine, beta-alanine and citrulline.",         34.99,  60, 3, "MuscleTech",         300,  List.of("Blue Raspberry","Watermelon","Green Apple"),          "https://images.unsplash.com/photo-1693996047008-1b6210099be1?q=80&w=870&auto=format&fit=crop","2024-03-01T00:00:00.000Z"),
            prod("Clean Energy Pre-Workout",     "Natural caffeine from green tea with adaptogens for sustained energy.",     39.99,  45, 3, "Transparent Labs",   250,  List.of("Lemon Lime","Orange"),                                "https://images.unsplash.com/photo-1704650311981-419f841421cc?q=80&w=870&auto=format&fit=crop","2024-03-15T00:00:00.000Z"),
            prod("Stim-Free Pre-Workout",        "Caffeine-free formula with pump-enhancing nitrates and nootropics.",        37.99,  35, 3, "Legion",             280,  List.of("Grape","Strawberry Kiwi"),                            "https://images.unsplash.com/photo-1693996046744-d7d7434bc777?q=80&w=2070&auto=format&fit=crop","2024-03-20T00:00:00.000Z"),
            prod("BCAA 2:1:1 Instantized",       "BCAAs in the optimal 2:1:1 ratio. Prevents catabolism during training.",    24.99, 120, 4, "Scitec",             400,  List.of("Tropical","Cola","Unflavored"),                       "https://plus.unsplash.com/premium_photo-1672352722063-678ed538f80e?q=80&w=2070&auto=format&fit=crop","2024-04-01T00:00:00.000Z"),
            prod("EAA Essential Amino Matrix",   "All 9 essential amino acids for complete muscle protein synthesis.",        32.99,  75, 4, "Kaged Muscle",       350,  List.of("Cherry Limeade","Watermelon"),                        "https://images.unsplash.com/photo-1622227922682-56c92e523e58?q=80&w=2070&auto=format&fit=crop","2024-04-10T00:00:00.000Z"),
            prod("L-Glutamine Recovery",         "Pure L-glutamine to support gut health, immunity and muscle recovery.",     17.99, 180, 4, "NOW Sports",         500,  List.of("Unflavored"),                                         "https://images.unsplash.com/photo-1665757516805-ead01c014ceb?q=80&w=580&auto=format&fit=crop", "2024-04-15T00:00:00.000Z"),
            prod("Athlete Multivitamin Complex", "25+ vitamins and minerals tailored for high-performance athletes.",         22.99, 200, 5, "Optimum Nutrition",  150,  List.of("Tablets"),                                            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop",          "2024-05-01T00:00:00.000Z"),
            prod("Vitamin D3 + K2 5000 IU",      "High-potency D3 combined with K2 MK-7 for bone health and immunity.",      14.99, 300, 5, "Life Extension",      50,  List.of("Softgels"),                                           "https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop",          "2024-05-10T00:00:00.000Z"),
            prod("Omega-3 Fish Oil Triple Strength","3000mg of EPA and DHA per serving for heart, brain and joint health.",   18.99, 160, 5, "Nordic Naturals",    120,  List.of("Lemon","Unflavored"),                                 "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop",          "2024-05-15T00:00:00.000Z"),
            prod("Thermogenic Fat Burner X",     "Green tea, caffeine and CLA blend to maximize fat oxidation.",              42.99,  55, 6, "MuscleTech",         180,  List.of("Capsules"),                                           "https://images.unsplash.com/photo-1670850757896-e1b6c3e311ea?q=80&w=2071&auto=format&fit=crop","2024-06-01T00:00:00.000Z"),
            prod("L-Carnitine 3000 Liquid",      "Liquid L-Carnitine for fat transport during cardio sessions.",              26.99,  80, 6, "Scitec",             500,  List.of("Tropical","Cherry"),                                  "https://images.unsplash.com/photo-1729701028046-2bd5b736a6d7?q=80&w=387&auto=format&fit=crop","2024-06-15T00:00:00.000Z"),
            prod("Serious Mass 12 lbs",          "1250 calories per serving with 50g protein for extreme muscle growth.",     79.99,  40, 7, "Optimum Nutrition", 5443, List.of("Chocolate","Vanilla","Banana"),                       "https://plus.unsplash.com/premium_photo-1727470834652-e588752a1098?q=80&w=870&auto=format&fit=crop","2024-07-01T00:00:00.000Z"),
            prod("True Mass 1200",               "215g carbs and 50g protein per serving for hard gainers.",                  69.99,  30, 7, "BSN",               4730, List.of("Chocolate Milkshake","Cookies & Cream"),               "https://plus.unsplash.com/premium_photo-1726217054219-4e50356b4dfc?q=80&w=2070&auto=format&fit=crop","2024-07-10T00:00:00.000Z"),
            prod("ZMA Sleep & Recovery",         "Zinc, magnesium and B6 for deep sleep and muscle recovery.",                21.99, 130, 8, "NOW Sports",          90,  List.of("Capsules"),                                           "https://images.unsplash.com/photo-1522335579687-9c718c5184d7?q=80&w=871&auto=format&fit=crop","2024-08-01T00:00:00.000Z"),
            prod("Electrolyte Recovery Drink",   "Sodium, potassium, magnesium and coconut water for rapid rehydration.",     28.99, 100, 8, "Nuun",               360,  List.of("Lemon Ginger","Berry","Orange"),                      "https://images.unsplash.com/photo-1655976515592-ade289fd4881?q=80&w=282&auto=format&fit=crop","2024-08-10T00:00:00.000Z"),
            prod("Collagen Peptides Sport",      "Hydrolyzed collagen peptides for joint health and tendon strength.",        35.99,  85, 8, "Vital Proteins",     567,  List.of("Unflavored","Vanilla Coconut"),                       "https://images.unsplash.com/photo-1709907325862-170caa96e8bb?q=80&w=867&auto=format&fit=crop","2024-08-20T00:00:00.000Z"),
            prod("Tart Cherry Extract",          "Natural anti-inflammatory to reduce DOMS and speed recovery.",              19.99, 110, 8, "Swanson",            120,  List.of("Capsules"),                                           "https://plus.unsplash.com/premium_photo-1687977547550-9eec1b522b40?q=80&w=387&auto=format&fit=crop","2024-08-25T00:00:00.000Z"),
            prod("Whey Isolate CFM 90%",         "Cross-flow micro-filtered whey isolate. 90% protein, zero lactose.",        74.99,  50, 1, "Scitec",             900,  List.of("White Chocolate","Pistachio","Chocolate"),            "https://images.unsplash.com/photo-1693996045300-521e9d08cabc?q=80&w=870&auto=format&fit=crop","2024-09-01T00:00:00.000Z"),
            prod("Protein Bar Box (12 units)",   "High-protein bars with 20g protein, low sugar and real chocolate coating.", 29.99, 200, 1, "Quest",              600,  List.of("Cookies & Cream","Birthday Cake","Chocolate Brownie"), "https://plus.unsplash.com/premium_photo-1664392029345-eba492b172d8?q=80&w=744&auto=format&fit=crop","2024-09-10T00:00:00.000Z")
        ));
    }

    private void initUsers() {
        String seed = "2024-01-01T00:00:00.000Z";
        userRepo.saveAll(List.of(
            User.builder().username("admin").password("admin123").name("Administrator").role("admin").avatarUrl("").createdAt(seed).build(),
            User.builder().username("user").password("user123").name("John Doe").role("user").avatarUrl("").createdAt(seed).build()
        ));
    }

    private void initBlogs() {
        blogRepo.saveAll(List.of(
            Blog.builder()
                .title("Effects caused by the creatine on the body")
                .description("Creatine is one of the most researched and widely used supplements in sports nutrition. Naturally found in small amounts in foods like red meat and fish, and also synthesized in the liver, kidneys, and pancreas, creatine plays a fundamental role in energy production, especially during short bursts of high-intensity exercise. When taken as a supplement, it produces several notable physiological effects throughout the body.\n\nOne of the primary effects of creatine is the increase in ATP (adenosine triphosphate) production. ATP is the main energy currency of the cell, and during intense activities such as sprinting or weightlifting, it is rapidly depleted. Creatine helps regenerate ATP by donating a phosphate group to ADP (adenosine diphosphate), quickly restoring energy levels. This allows muscles to maintain peak performance for longer periods, delaying fatigue and improving overall exercise capacity.\n\nAnother significant effect is the enhancement of muscle strength and power. Numerous studies have shown that creatine supplementation increases maximal strength, explosive power, and repetition performance during resistance training. Over time, this leads to greater training volume and, consequently, improved muscle growth, a process known as hypertrophy. Athletes in sports like football, sprinting, and bodybuilding often use creatine specifically for this purpose.\n\nCreatine also causes an increase in muscle hydration and cell volume. It draws water into muscle cells, making them fuller and more voluminous. This not only contributes to a more muscular appearance but also creates a more anabolic environment within the cell, which can promote protein synthesis and reduce muscle breakdown.\n\nBeyond its effects on muscles, creatine has been shown to influence brain health and cognitive function. The brain also requires ATP for optimal performance, and creatine may help improve short-term memory, reduce mental fatigue, and support neurological health.\n\nFinally, creatine is generally considered safe for healthy individuals when taken at recommended doses. Common side effects, when they occur, are usually mild and may include gastrointestinal discomfort or muscle cramping.")
                .imageUrl("https://images.unsplash.com/photo-1693996045435-af7c48b9cafb?q=80&w=870&auto=format&fit=crop")
                .createdAt("2025-01-30T00:00:00.000Z")
                .build(),
            Blog.builder()
                .title("When and How to Take Protein: A Simple Guide")
                .description("Protein is essential for building and repairing muscles, but timing and method can help you get the most out of it. While your total daily intake matters most, paying attention to when and how you take protein can improve your results, especially if you exercise regularly.\n\nThe best time to take protein is right after your workout. Within 30 to 60 minutes of exercise, your muscles are ready to absorb nutrients and begin repair. This is often called the \"anabolic window.\" A fast-digesting protein like whey is ideal at this moment to boost muscle recovery and growth. That said, you don't need to rely only on post-workout protein. Spreading your intake evenly across meals—about 20 to 40 grams per meal—helps keep your muscles fueled throughout the day. Another good time is before bed. A slow-digesting protein like casein provides a steady release of amino acids while you sleep, helping reduce muscle breakdown overnight.\n\nAs for how to take protein, the easiest way is through shakes. Just mix protein powder with water, milk, or a plant-based drink. You can also blend it into smoothies with fruit or peanut butter for extra flavor and nutrients. If you prefer solid food, you can add protein powder to oatmeal, yogurt, pancakes, or homemade snacks. Don't forget whole food sources either—eggs, chicken, fish, Greek yogurt, and tofu are excellent options.\n\nIn short, take protein after workouts, spread it throughout the day, and consider a slow-digesting option before bed. Use shakes for convenience and whole foods for variety. Stay consistent, stay hydrated, and you'll get the most out of your protein intake.")
                .imageUrl("https://images.unsplash.com/photo-1693996045899-7cf0ac0229c7?q=80&w=870&auto=format&fit=crop")
                .createdAt("2025-07-03T00:00:00.000Z")
                .build()
        ));
    }

    private Category cat(String name, String slug, String desc, String icon, String img, String createdAt) {
        return Category.builder().name(name).slug(slug).description(desc).icon(icon).imageUrl(img).createdAt(createdAt).build();
    }

    private Product prod(String name, String desc, double price, int stock, int catId,
                         String brand, int weight, List<String> flavors, String img, String createdAt) {
        return Product.builder().name(name).description(desc).price(price).stock(stock)
                .categoryId(catId).brand(brand).weight(weight).flavors(flavors)
                .imageUrl(img).createdAt(createdAt).build();
    }
}
