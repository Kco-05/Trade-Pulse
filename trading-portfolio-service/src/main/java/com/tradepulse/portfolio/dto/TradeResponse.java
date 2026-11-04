package com.tradepulse.portfolio.dto;

import java.math.BigDecimal;

public record TradeResponse(
        Long transactionId,
        String status,
        BigDecimal executionPrice
) {
}
