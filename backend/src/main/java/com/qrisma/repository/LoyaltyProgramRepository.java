package com.qrisma.repository;

import com.qrisma.model.LoyaltyProgram;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LoyaltyProgramRepository extends JpaRepository<LoyaltyProgram, UUID> {
    List<LoyaltyProgram> findByOwnerId(UUID ownerId);
}