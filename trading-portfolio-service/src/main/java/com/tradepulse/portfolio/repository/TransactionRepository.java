package com.tradepulse.portfolio.repository;

import com.tradepulse.portfolio.entity.Transaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTimestampDescTransactionIdDesc(Long userId);
}
