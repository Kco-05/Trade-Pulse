package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record StockView(String tickerSymbol, String companyName, BigDecimal currentPrice) {

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }
}
