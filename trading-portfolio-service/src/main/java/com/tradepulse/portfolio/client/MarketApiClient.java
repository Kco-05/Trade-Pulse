package com.tradepulse.portfolio.client;

import com.tradepulse.portfolio.dto.StockPriceResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class MarketApiClient {

    private static final String SERVICE_NAME = "Market";

    private final RestTemplate restTemplate;

    public MarketApiClient(RestTemplateBuilder builder, @Value("${market.base-url}") String baseUrl) {
        this.restTemplate = builder
                .rootUri(baseUrl)
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }

    public StockPriceResponse getPrice(String tickerSymbol) {
        return DownstreamErrors.call(SERVICE_NAME, () -> restTemplate.getForObject(
                "/api/stocks/{ticker}", StockPriceResponse.class, tickerSymbol));
    }
}
