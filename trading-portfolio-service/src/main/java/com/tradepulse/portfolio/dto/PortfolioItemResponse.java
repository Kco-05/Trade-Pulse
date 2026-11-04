package com.tradepulse.portfolio.dto;

import java.math.BigDecimal;

public record PortfolioItemResponse(
        String tickerSymbol,
        Integer totalQuantity,
        BigDecimal averageBuyPrice,
        BigDecimal currentMarketPrice,
        BigDecimal profitLoss
) {
}
