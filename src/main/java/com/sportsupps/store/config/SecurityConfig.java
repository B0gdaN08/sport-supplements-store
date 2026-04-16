package com.sportsupps.store.config;

import com.sportsupps.store.security.JwtAuthFilter;
import javax.servlet.http.HttpServletResponse;
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
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
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
                .requestMatchers(new AntPathRequestMatcher("/api/auth/login")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/auth/register")).permitAll()
                // Public read endpoints
                .requestMatchers(new AntPathRequestMatcher("/api/categories/**", HttpMethod.GET.name())).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/api/products/**", HttpMethod.GET.name())).permitAll()
                // Orders GET is optional-auth (handled in controller)
                .requestMatchers(new AntPathRequestMatcher("/api/orders/**", HttpMethod.GET.name())).permitAll()
                // Admin-only: user management write ops
                .requestMatchers(new AntPathRequestMatcher("/api/auth/users/**", HttpMethod.PUT.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/auth/users/**", HttpMethod.DELETE.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/auth/users")).hasAuthority("admin")
                // Admin-only: categories write
                .requestMatchers(new AntPathRequestMatcher("/api/categories/**", HttpMethod.POST.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/categories/**", HttpMethod.PUT.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/categories/**", HttpMethod.PATCH.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/categories/**", HttpMethod.DELETE.name())).hasAuthority("admin")
                // Admin-only: products write
                .requestMatchers(new AntPathRequestMatcher("/api/products/**", HttpMethod.POST.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/products/**", HttpMethod.PUT.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/products/**", HttpMethod.PATCH.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/products/**", HttpMethod.DELETE.name())).hasAuthority("admin")
                // Admin-only: orders write
                .requestMatchers(new AntPathRequestMatcher("/api/orders/**", HttpMethod.PUT.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/orders/**", HttpMethod.PATCH.name())).hasAuthority("admin")
                .requestMatchers(new AntPathRequestMatcher("/api/orders/**", HttpMethod.DELETE.name())).hasAuthority("admin")
                // Static resources
                .requestMatchers(new AntPathRequestMatcher("/")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/*.html")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/css/**")).permitAll()
                .requestMatchers(new AntPathRequestMatcher("/js/**")).permitAll()
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
