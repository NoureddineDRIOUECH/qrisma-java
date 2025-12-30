package com.qrisma.controller;

import com.qrisma.model.StoreSettings;
import com.qrisma.repository.StoreSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    @Autowired
    private StoreSettingsRepository settingsRepo;

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        Optional<StoreSettings> maybe = settingsRepo.findById(1L);
        if (maybe.isPresent()) {
            return ResponseEntity.ok(maybe.get());
        }
        // Return empty settings if none exist
        StoreSettings empty = new StoreSettings();
        empty.setId(1L);
        empty.setStoreName("");
        empty.setEmail("");
        empty.setPhone("");
        empty.setAddress("");
        empty.setWebsite("");
        empty.setDescription("");
        return ResponseEntity.ok(empty);
    }

    @PostMapping("/settings")
    public ResponseEntity<?> saveSettings(@RequestBody StoreSettings settings) {
        try {
            // Always use ID 1 for the main store settings
            settings.setId(1L);
            StoreSettings saved = settingsRepo.save(settings);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
