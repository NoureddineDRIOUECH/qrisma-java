package com.qrisma.controller;

import com.qrisma.model.User;
import com.qrisma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @PostMapping("/signup-owner")
    public ResponseEntity<?> signupOwner(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email exists"));
        }
        User u = new User();
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(password));
        u.setRole("OWNER");
        u.setFirstName(body.getOrDefault("firstName", ""));
        u.setLastName(body.getOrDefault("lastName", ""));
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("message", "owner created"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String pw = body.get("password");
        var opt = userRepository.findByEmail(email);
        if (opt.isEmpty())
            return ResponseEntity.status(401).body(Map.of("error", "invalid"));
        User u = opt.get();
        if (!passwordEncoder.matches(pw, u.getPasswordHash()))
            return ResponseEntity.status(401).body(Map.of("error", "invalid"));
        // Return user info and token
        return ResponseEntity.ok(Map.of(
                "userId", u.getId().toString(),
                "email", u.getEmail(),
                "role", u.getRole(),
                "token", "bearer-token-" + u.getId()));
    }
}