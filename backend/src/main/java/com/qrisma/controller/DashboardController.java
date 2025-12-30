package com.qrisma.controller;

import com.qrisma.model.Customer;
import com.qrisma.model.LoyaltyProgram;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;
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
            List<UUID> programIds = ownerPrograms.stream().map(LoyaltyProgram::getId).collect(Collectors.toList());

            // Filter customers by owner's programs
            List<Customer> ownerCustomers = programIds.isEmpty() ? List.of()
                    : customerRepo.findAll().stream()
                            .filter(c -> programIds.contains(c.getProgramId()))
                            .collect(Collectors.toList());

            List<UUID> customerIds = ownerCustomers.stream().map(Customer::getId).collect(Collectors.toList());

            long customers = ownerCustomers.size();
            long programs = ownerPrograms.size();
            long employees = userRepo.findAll().stream().filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole())).count();
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
        long employees = userRepo.findAll().stream().filter(u -> "EMPLOYEE".equalsIgnoreCase(u.getRole())).count();
        long transactions = txRepo.count();
        int totalPoints = customerRepo.findAll().stream().mapToInt(c -> c.getBalance()).sum();
        return ResponseEntity.ok(Map.of(
                "customers", customers,
                "programs", programs,
                "employees", employees,
                "transactions", transactions,
                "totalPoints", totalPoints));
    }
}
