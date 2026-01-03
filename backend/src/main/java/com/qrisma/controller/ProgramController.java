package com.qrisma.controller;

import com.qrisma.model.Customer;
import com.qrisma.model.LoyaltyProgram;
import com.qrisma.repository.CustomerRepository;
import com.qrisma.repository.LoyaltyProgramRepository;
import com.qrisma.service.GoogleWalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/programs")
public class ProgramController {

    @Autowired
    private LoyaltyProgramRepository programRepo;
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private GoogleWalletService googleWalletService;

    @PostMapping
    public ResponseEntity<?> createProgram(@RequestBody LoyaltyProgram p,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            p.setOwnerId(UUID.fromString(userIdHeader));
        }
        LoyaltyProgram saved = programRepo.save(p);
        return ResponseEntity.ok(saved);
    }

    @GetMapping
    public ResponseEntity<?> listPrograms(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader != null && !userIdHeader.isEmpty()) {
            return ResponseEntity.ok(programRepo.findByOwnerId(UUID.fromString(userIdHeader)));
        }
        return ResponseEntity.ok(programRepo.findAll());
    }

    @DeleteMapping("/{programId}")
    public ResponseEntity<?> deleteProgram(@PathVariable UUID programId) {
        Optional<LoyaltyProgram> maybe = programRepo.findById(programId);
        if (maybe.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "program not found"));
        programRepo.deleteById(programId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping("/{programId}")
    public ResponseEntity<?> updateProgram(@PathVariable UUID programId, @RequestBody LoyaltyProgram updatedProgram) {
        Optional<LoyaltyProgram> maybe = programRepo.findById(programId);
        if (maybe.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "program not found"));

        LoyaltyProgram existingProgram = maybe.get();
        existingProgram.setName(updatedProgram.getName());
        existingProgram.setDescription(updatedProgram.getDescription());
        existingProgram.setTemplateJson(updatedProgram.getTemplateJson());
        existingProgram.setPointsPerAction(updatedProgram.getPointsPerAction());
        existingProgram.setActive(updatedProgram.getActive());

        LoyaltyProgram saved = programRepo.save(existingProgram);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{programId}/enroll")
    public ResponseEntity<?> enroll(@PathVariable UUID programId, @RequestBody Map<String, String> body) {
        Optional<LoyaltyProgram> maybe = programRepo.findById(programId);
        if (maybe.isEmpty())
            return ResponseEntity.badRequest().body(Map.of("error", "program not found"));
        LoyaltyProgram program = maybe.get();

        Customer c = new Customer();
        c.setProgramId(programId);
        c.setFirstName(body.get("firstName"));
        c.setLastName(body.get("lastName"));
        c.setEmail(body.get("email"));
        c.setPhone(body.get("phone"));
        // save customer first
        Customer saved = customerRepo.save(c);

        // Set passObjectId to the Google Wallet object ID format
        String walletObjectId = String.format("%s.%s",
                googleWalletService.issuerId != null ? googleWalletService.issuerId : "issuer",
                saved.getId().toString().replace("-", "_"));
        saved.setPassObjectId(walletObjectId);
        customerRepo.save(saved);

        // Create Google Wallet Save JWT
        String saveJwt = googleWalletService.createSaveJwt(saved, program);

        return ResponseEntity.ok(Map.of(
                "customerId", saved.getId().toString(),
                "saveJwt", saveJwt,
                "passObjectId", walletObjectId));
    }
}