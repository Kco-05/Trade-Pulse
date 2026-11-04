package com.tradepulse.ui.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionView(
        Long transactionId,
        String tickerSymbol,
        String transactionType,
        Integer quantity,
        BigDecimal executionPrice,
        LocalDateTime timestamp
) {

    public Long getTransactionId() {
        return transactionId;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public String getTransactionType() {
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
