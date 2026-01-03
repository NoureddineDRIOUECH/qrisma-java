package com.qrisma.repository;

import com.qrisma.model.TransactionRecord;

import org.springframework.data.jpa.repository.JpaRepository;



import java.util.List;

import java.util.UUID;



public interface TransactionRepository extends JpaRepository<TransactionRecord, UUID> {

    List<TransactionRecord> findTop20ByOrderByCreatedAtDesc();

}
