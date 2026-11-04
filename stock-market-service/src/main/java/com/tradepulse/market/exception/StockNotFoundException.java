package com.tradepulse.market.exception;

public class StockNotFoundException extends RuntimeException {

    public StockNotFoundException(String tickerSymbol) {
        super("Stock not found: " + tickerSymbol);
    }
}
