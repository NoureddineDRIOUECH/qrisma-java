package com.qrisma.controller;

import com.qrisma.model.Customer;
import com.qrisma.model.LoyaltyProgram;
import com.qrisma.model.TransactionRecord;
import com.qrisma.repository.CustomerRepository;
import com.qrisma.repository.TransactionRepository;
import com.qrisma.repository.LoyaltyProgramRepository;
import com.qrisma.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
        @Autowired
        private CustomerRepository customerRepo;
        @Autowired
        private TransactionRepository txRepo;
        @Autowired
        private LoyaltyProgramRepository programRepo;
        @Autowired
        private UserRepository userRepo;

        @GetMapping("/stats")
        public ResponseEntity<?> stats(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
                if (userIdHeader != null && !userIdHeader.isEmpty()) {
                        UUID ownerId = UUID.fromString(userIdHeader);

                        // Get owner's programs
                        List<LoyaltyProgram> ownerPrograms = programRepo.findByOwnerId(ownerId);
                        List<UUID> programIds = ownerPrograms.stream().map(LoyaltyProgram::getId)
                                        .collect(Collectors.toList());

                        // Filter customers by owner's programs
                        List<Customer> ownerCustomers = programIds.isEmpty() ? List.of()
                                        : customerRepo.findAll().stream()
                                                        .filter(c -> programIds.contains(c.getProgramId()))
                                                        .collect(Collectors.toList());

                        List<UUID> customerIds = ownerCustomers.stream().map(Customer::getId)
                                        .collect(Collectors.toList());

                        long customers = ownerCustomers.size();
                        long programs = ownerPrograms.size();
                        long employees = userRepo.findAll().stream()
                                        .filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole())).count();
                        long transactions = customerIds.isEmpty() ? 0
                                        : txRepo.findAll().stream()
                                                        .filter(t -> customerIds.contains(t.getCustomerId()))
                                                        .count();
                        int totalPoints = ownerCustomers.stream().mapToInt(Customer::getBalance).sum();

                        return ResponseEntity.ok(Map.of(
                                        "customers", customers,
                                        "programs", programs,
                                        "employees", employees,
                                        "transactions", transactions,
                                        "totalPoints", totalPoints));
                }

                // Fallback: return all stats
                long customers = customerRepo.count();
                long programs = programRepo.count();
                long employees = userRepo.findAll().stream().filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole()))
                                .count();
                long transactions = txRepo.count();
                int totalPoints = customerRepo.findAll().stream().mapToInt(c -> c.getBalance()).sum();
                return ResponseEntity.ok(Map.of(
                                "customers", customers,
                                "programs", programs,
                                "employees", employees,
                                "transactions", transactions,
                                "totalPoints", totalPoints));
        }

        @GetMapping("/analytics")
        public ResponseEntity<?> analytics(@RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
                List<LoyaltyProgram> allPrograms = programRepo.findAll();
                List<Customer> allCustomers = customerRepo.findAll();
                List<TransactionRecord> allTransactions = txRepo.findAll();

                List<LoyaltyProgram> scopedPrograms = allPrograms;
                List<Customer> scopedCustomers = allCustomers;
                List<TransactionRecord> scopedTransactions = allTransactions;

                if (userIdHeader != null && !userIdHeader.isEmpty()) {
                        UUID ownerId = UUID.fromString(userIdHeader);
                        scopedPrograms = programRepo.findByOwnerId(ownerId);

                        Set<UUID> programIds = scopedPrograms.stream()
                                        .map(LoyaltyProgram::getId)
                                        .collect(Collectors.toSet());

                        scopedCustomers = programIds.isEmpty() ? List.of()
                                        : allCustomers.stream()
                                                        .filter(c -> programIds.contains(c.getProgramId()))
                                                        .collect(Collectors.toList());

                        Set<UUID> customerIds = scopedCustomers.stream()
                                        .map(Customer::getId)
                                        .collect(Collectors.toSet());

                        scopedTransactions = customerIds.isEmpty() ? List.of()
                                        : allTransactions.stream()
                                                        .filter(t -> customerIds.contains(t.getCustomerId()))
                                                        .collect(Collectors.toList());
                }

                final List<Customer> customers = scopedCustomers;
                final List<TransactionRecord> transactions = scopedTransactions;
                final List<LoyaltyProgram> programs = scopedPrograms;

                // Calculate metrics
                long totalCustomers = customers.size();
                long totalPrograms = programs.size();
                long totalTransactions = transactions.size();
                long pointsIssued = transactions.stream()
                                .filter(t -> "ADD_POINTS".equalsIgnoreCase(t.getType()))
                                .mapToLong(TransactionRecord::getPoints)
                                .sum();
                long pointsRedeemed = transactions.stream()
                                .filter(t -> "REDEEM".equalsIgnoreCase(t.getType()))
                                .mapToLong(TransactionRecord::getPoints)
                                .sum();

                // Transaction trends (last 7 days)
                List<Map<String, Object>> transactionTrends = new ArrayList<>();
                LocalDate today = LocalDate.now();
                for (int i = 6; i >= 0; i--) {
                        LocalDate date = today.minusDays(i);
                        final LocalDate finalDate = date;
                        long count = transactions.stream()
                                        .filter(t -> {
                                                LocalDate txDate = t.getCreatedAt().toInstant()
                                                                .atZone(ZoneId.systemDefault())
                                                                .toLocalDate();
                                                return txDate.equals(finalDate);
                                        })
                                        .count();
                        transactionTrends.add(Map.of(
                                        "date", date.toString(),
                                        "transactions", count));
                }

                // Program performance
                List<Map<String, Object>> programPerformance = new ArrayList<>();
                for (LoyaltyProgram program : programs) {
                        List<Customer> programCustomers = customers.stream()
                                        .filter(c -> program.getId().equals(c.getProgramId()))
                                        .collect(Collectors.toList());
                        long programTransactions = transactions.stream()
                                        .filter(t -> programCustomers.stream()
                                                        .anyMatch(c -> c.getId().equals(t.getCustomerId())))
                                        .count();
                        programPerformance.add(Map.of(
                                        "name", program.getName(),
                                        "customers", programCustomers.size(),
                                        "transactions", programTransactions));
                }

                // Transaction type breakdown
                long addPointsCount = transactions.stream()
                                .filter(t -> "ADD_POINTS".equalsIgnoreCase(t.getType()))
                                .count();
                long redeemCount = transactions.stream()
                                .filter(t -> "REDEEM".equalsIgnoreCase(t.getType()))
                                .count();

                // Build response
                Map<String, Object> response = new HashMap<>();
                response.put("summary", Map.of(
                                "totalCustomers", totalCustomers,
                                "totalPrograms", totalPrograms,
                                "totalTransactions", totalTransactions,
                                "pointsIssued", pointsIssued,
                                "pointsRedeemed", pointsRedeemed,
                                "pointsInCirculation", pointsIssued - pointsRedeemed));
                response.put("transactionTrends", transactionTrends);
                response.put("programPerformance", programPerformance);
                response.put("transactionBreakdown", Map.of(
                                "addPoints", addPointsCount,
                                "redeem", redeemCount));

                return ResponseEntity.ok(response);
        }
}