package com.tradepulse.portfolio.client;

import com.tradepulse.portfolio.dto.ErrorResponse;
import com.tradepulse.portfolio.exception.DownstreamException;
import com.tradepulse.portfolio.exception.ServiceUnavailableException;
import java.util.function.Supplier;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;

final class DownstreamErrors {

    private DownstreamErrors() {
    }

    static <T> T call(String serviceName, Supplier<T> request) {
        try {
            return request.get();
        } catch (HttpClientErrorException ex) {
            throw new DownstreamException(ex.getStatusCode(), errorMessage(ex));
        } catch (HttpServerErrorException | ResourceAccessException ex) {
            throw new ServiceUnavailableException(serviceName);
        }
    }

    private static String errorMessage(HttpClientErrorException ex) {
        try {
            ErrorResponse body = ex.getResponseBodyAs(ErrorResponse.class);
            if (body != null && body.error() != null) {
                return body.error();
            }
        } catch (RuntimeException ignored) {
            // body was not {"error":...}; fall back to the status text
        }
        return ex.getStatusText();
    }
}
