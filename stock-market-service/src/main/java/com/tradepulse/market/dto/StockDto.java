package com.tradepulse.market.dto;

import java.math.BigDecimal;

public record StockDto(
        String tickerSymbol,
        String companyName,
        BigDecimal currentPrice
) {
}
