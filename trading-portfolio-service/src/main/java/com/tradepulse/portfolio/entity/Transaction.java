package com.tradepulse.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transaction_id")
    private Long transactionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "ticker_symbol", length = 10, nullable = false)
    private String tickerSymbol;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", length = 4, nullable = false)
    private TransactionType transactionType;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "execution_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal executionPrice;

    @Column(name = "executed_at", nullable = false)
    private LocalDateTime timestamp;

    protected Transaction() {
    }

    public Transaction(Long userId, String tickerSymbol, TransactionType transactionType,
                       Integer quantity, BigDecimal executionPrice, LocalDateTime timestamp) {
        this.userId = userId;
        this.tickerSymbol = tickerSymbol;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.executionPrice = executionPrice;
        this.timestamp = timestamp;
    }

    public Long getTransactionId() {
        return transactionId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public TransactionType getTransactionType() {
        return transactionType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getExecutionPrice() {
        return executionPrice;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}
