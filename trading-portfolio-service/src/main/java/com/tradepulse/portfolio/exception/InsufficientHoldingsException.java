package com.tradepulse.portfolio.exception;

public class InsufficientHoldingsException extends RuntimeException {

    public InsufficientHoldingsException() {
        super("Insufficient holdings");
    }
}
