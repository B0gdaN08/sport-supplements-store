package com.sportsupps.store.config;

import com.sportsupps.store.security.JwtAuthFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((req, res, e) -> {
                    res.setContentType("application/json");
                    res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    res.getWriter().write("{\"success\":false,\"error\":\"Authentication required.\"}");
                })
                .accessDeniedHandler((req, res, e) -> {
                    res.setContentType("application/json");
                    res.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    res.getWriter().write("{\"success\":false,\"error\":\"Access denied. Admin role required.\"}");
                })
            )
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers("/api/auth/login", "/api/auth/register").permitAll()
                // Public read endpoints
                .requestMatchers(HttpMethod.GET, "/api/categories/**", "/api/products/**").permitAll()
                // Orders GET is optional-auth (handled in controller)
                .requestMatchers(HttpMethod.GET, "/api/orders/**").permitAll()
                // Admin-only: user management write ops
                .requestMatchers(HttpMethod.PUT, "/api/auth/users/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/auth/users/**").hasAuthority("admin")
                .requestMatchers("/api/auth/users").hasAuthority("admin")
                // Admin-only: categories write
                .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/categories/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasAuthority("admin")
                // Admin-only: products write
                .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/products/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("admin")
                // Admin-only: orders write
                .requestMatchers(HttpMethod.PUT, "/api/orders/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.PATCH, "/api/orders/**").hasAuthority("admin")
                .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasAuthority("admin")
                // Static resources
                .requestMatchers("/", "/*.html", "/css/**", "/js/**").permitAll()
                // Everything else requires auth
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
