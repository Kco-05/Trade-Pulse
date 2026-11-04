package com.tradepulse.ui.dto;

public record TradeRequest(Long userId, String tickerSymbol, Integer quantity) {
}
