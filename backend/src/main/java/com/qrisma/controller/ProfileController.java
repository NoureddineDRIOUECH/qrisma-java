package com.qrisma.controller;

import com.qrisma.model.User;
import com.qrisma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
public class ProfileController {

    @Autowired
    private UserRepository userRepo;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // For MVP: return first OWNER user, or create one if missing
    @GetMapping("/api/profile")
    public ResponseEntity<?> get() {
        Optional<User> owner = userRepo.findAll().stream().filter(u -> "OWNER".equalsIgnoreCase(u.getRole()))
                .findFirst();
        if (owner.isEmpty()) {
            User u = new User();
            u.setEmail("owner@example.com");
            u.setFirstName("Owner");
            u.setRole("OWNER");
            u.setPasswordHash(passwordEncoder.encode("changeme123"));
            owner = Optional.of(userRepo.save(u));
        }
        return ResponseEntity.ok(owner.get());
    }

    @PutMapping("/api/profile")
    public ResponseEntity<?> update(@RequestBody Map<String, String> body) {
        Optional<User> owner = userRepo.findAll().stream().filter(u -> "OWNER".equalsIgnoreCase(u.getRole()))
                .findFirst();
        if (owner.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "owner not found"));
        User u = owner.get();
        if (body.containsKey("firstName"))
            u.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName"))
            u.setLastName(body.get("lastName"));
        if (body.containsKey("phone"))
            u.setPhone(body.get("phone"));
        if (body.containsKey("email"))
            u.setEmail(body.get("email"));
        if (body.containsKey("password") && body.get("password") != null && !body.get("password").isEmpty()) {
            u.setPasswordHash(passwordEncoder.encode(body.get("password")));
        }
        return ResponseEntity.ok(userRepo.save(u));
    }

    @PutMapping("/api/users/{userId}/password")
    public ResponseEntity<?> updatePassword(@PathVariable UUID userId, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepo.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Current and new passwords required"));
        }

        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Current password is incorrect"));
        }

        // Update to new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepo.save(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Password updated successfully"));
    }
}
