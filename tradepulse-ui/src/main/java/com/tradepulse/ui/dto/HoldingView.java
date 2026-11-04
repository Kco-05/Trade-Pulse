package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record HoldingView(
        String tickerSymbol,
        Integer totalQuantity,
        BigDecimal averageBuyPrice,
        BigDecimal currentMarketPrice,
        BigDecimal profitLoss
) {

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public BigDecimal getCurrentMarketPrice() {
        return currentMarketPrice;
    }

    public BigDecimal getProfitLoss() {
        return profitLoss;
    }
}
