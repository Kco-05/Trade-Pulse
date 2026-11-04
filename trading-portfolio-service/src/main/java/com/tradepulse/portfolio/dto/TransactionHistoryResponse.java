package com.tradepulse.portfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(
        Long transactionId,
        String tickerSymbol,
        String transactionType,
        Integer quantity,
        BigDecimal executionPrice,
        LocalDateTime timestamp
) {
}
