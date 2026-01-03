package com.qrisma.controller;

import com.qrisma.model.TransactionRecord;
import com.qrisma.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private TransactionRepository transactionRepository;

    @GetMapping("/recent")
    public ResponseEntity<List<TransactionRecord>> getRecentActivity() {
        List<TransactionRecord> recentTransactions = transactionRepository.findTop20ByOrderByCreatedAtDesc();
        return ResponseEntity.ok(recentTransactions);
    }
}
