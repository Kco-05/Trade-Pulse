package com.tradepulse.portfolio.dto;

import java.math.BigDecimal;

public record StockPriceResponse(
        String tickerSymbol,
        BigDecimal currentPrice
) {
}
