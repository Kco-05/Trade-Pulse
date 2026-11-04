package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record StockView(String tickerSymbol, String companyName, BigDecimal currentPrice) {
}
