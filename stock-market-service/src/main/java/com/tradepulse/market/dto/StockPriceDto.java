package com.tradepulse.market.dto;

import java.math.BigDecimal;

public record StockPriceDto(
        String tickerSymbol,
        BigDecimal currentPrice
) {
}
