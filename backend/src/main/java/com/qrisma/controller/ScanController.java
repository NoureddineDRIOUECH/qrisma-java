package com.qrisma.controller;

import com.qrisma.model.Customer;
import com.qrisma.model.TransactionRecord;
import com.qrisma.model.LoyaltyProgram;
import com.qrisma.repository.CustomerRepository;
import com.qrisma.repository.LoyaltyProgramRepository;
import com.qrisma.repository.TransactionRepository;
import com.qrisma.service.GoogleWalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/scan")
public class ScanController {
    @Autowired
    private CustomerRepository customerRepo;
    @Autowired
    private LoyaltyProgramRepository programRepo;
    @Autowired
    private TransactionRepository txRepo;
    @Autowired
    private GoogleWalletService googleWalletService;

    @PostMapping("/lookup")
    public ResponseEntity<?> lookup(@RequestBody Map<String, String> body) {
        String passObjectId = body.get("passObjectId");
        Optional<Customer> maybe = customerRepo.findByPassObjectId(passObjectId);
        if (maybe.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "not found"));
        Customer c = maybe.get();
        return ResponseEntity.ok(
                Map.of("customerId", c.getId().toString(), "firstName", c.getFirstName(), "balance", c.getBalance()));
    }

    @PostMapping("/{customerId}/transactions")
    public ResponseEntity<?> transact(@PathVariable UUID customerId, @RequestBody Map<String, Object> body) {
        Optional<Customer> maybe = customerRepo.findById(customerId);
        if (maybe.isEmpty())
            return ResponseEntity.status(404).body(Map.of("error", "customer not found"));
        Customer c = maybe.get();
        Optional<LoyaltyProgram> maybeProgram = Optional.empty();
        if (c.getProgramId() != null) {
            maybeProgram = Optional.ofNullable(programRepo.findById(c.getProgramId()).orElse(null));
        }
        String type = (String) body.get("type");
        Integer points = (Integer) body.get("points");
        UUID employeeId = null;
        if (body.get("employeeId") != null)
            employeeId = UUID.fromString((String) body.get("employeeId"));

        if ("ADD_POINTS".equals(type)) {
            c.setBalance(c.getBalance() + points);
        } else if ("REDEEM".equals(type)) {
            c.setBalance(c.getBalance() - points);
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid type"));
        }
        customerRepo.save(c);

        TransactionRecord tx = new TransactionRecord();
        tx.setCustomerId(customerId);
        tx.setEmployeeId(employeeId);
        tx.setType(type);
        tx.setPoints(points);
        tx.setNote((String) body.getOrDefault("note", ""));
        txRepo.save(tx);

        // Update Google Wallet object with new balance
        if (c.getPassObjectId() != null && !c.getPassObjectId().isEmpty()) {
            // Build text modules from template if available
            java.util.List<java.util.Map<String, Object>> textModules = new java.util.ArrayList<>();
            textModules.add(java.util.Map.of("header", "Member ID", "body", c.getId().toString(), "id", "member_id"));
            textModules.add(
                    java.util.Map.of("header", "Your Points", "body", String.valueOf(c.getBalance()), "id", "points"));
            if (maybeProgram.isPresent()) {
                LoyaltyProgram program = maybeProgram.get();
                String tmpl = program.getTemplateJson();
                try {
                    if (tmpl != null && !tmpl.isEmpty()) {
                        com.fasterxml.jackson.databind.ObjectMapper om = new com.fasterxml.jackson.databind.ObjectMapper();
                        java.util.Map<String, Object> t = om.readValue(tmpl, java.util.Map.class);
                        java.util.List<java.util.Map<String, Object>> rewards = (java.util.List<java.util.Map<String, Object>>) t
                                .getOrDefault("rewards", java.util.List.of());
                        int balance = c.getBalance();
                        int available = 0;
                        Integer nextReq = null;
                        String nextName = null;
                        for (java.util.Map<String, Object> r : rewards) {
                            int req = Integer.parseInt(String
                                    .valueOf(r.getOrDefault("stampsRequired", r.getOrDefault("pointsRequired", 0))));
                            if (balance >= req)
                                available++;
                            if ((nextReq == null || req < nextReq) && balance < req) {
                                nextReq = req;
                                nextName = String.valueOf(r.getOrDefault("rewardName", "Reward"));
                            }
                        }
                        if (nextReq != null) {
                            int until = nextReq - balance;
                            textModules.add(java.util.Map.of("header", "Stamps Until Next Reward", "body",
                                    String.valueOf(until), "id", "stamps_until_reward"));
                            textModules.add(
                                    java.util.Map.of("header", "Next Reward", "body", nextName, "id", "next_reward"));
                        }
                        textModules.add(java.util.Map.of("header", "Available Rewards", "body",
                                String.valueOf(available), "id", "available_rewards"));
                    }
                } catch (Exception ignore) {
                }
            }
            googleWalletService.updateObjectBalance(c.getPassObjectId(), c.getBalance(), textModules);
        }

        return ResponseEntity.ok(Map.of("newBalance", c.getBalance(), "txId", tx.getId().toString()));
    }
}