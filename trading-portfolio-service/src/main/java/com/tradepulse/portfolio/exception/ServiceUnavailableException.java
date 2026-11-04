package com.tradepulse.portfolio.exception;

public class ServiceUnavailableException extends RuntimeException {

    public ServiceUnavailableException(String serviceName) {
        super(serviceName + " service unavailable");
    }
}
