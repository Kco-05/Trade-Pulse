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
}
