package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record HoldingView(
        String tickerSymbol,
        Integer totalQuantity,
        BigDecimal averageBuyPrice,
        BigDecimal currentMarketPrice,
        BigDecimal profitLoss
) {
}
