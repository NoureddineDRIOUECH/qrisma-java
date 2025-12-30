package com.qrisma.controller;

import com.qrisma.model.User;
import com.qrisma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/employees")
public class EmployeesController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> list() {
        List<User> employees = userRepo.findAll().stream().filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole()))
                .toList();
        return ResponseEntity.ok(employees);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        User u = new User();
        u.setEmail(body.get("email"));
        u.setFirstName(body.get("firstName"));
        u.setLastName(body.get("lastName"));
        u.setPhone(body.get("phone"));
        u.setRole("EMPLOYEE");
        String pwd = body.getOrDefault("password", "changeme123");
        u.setPasswordHash(passwordEncoder.encode(pwd));
        User saved = userRepo.save(u);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        Optional<User> maybe = userRepo.findById(id);
        if (maybe.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "not found"));
        User u = maybe.get();
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
        User saved = userRepo.save(u);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable UUID id) {
        userRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("deleted", id.toString()));
    }
}
