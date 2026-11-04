package com.tradepulse.portfolio.client;

import com.tradepulse.portfolio.dto.WalletBalanceResponse;
import java.math.BigDecimal;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class WalletApiClient {

    private static final String SERVICE_NAME = "Wallet";

    private final RestTemplate restTemplate;

    public WalletApiClient(RestTemplateBuilder builder, @Value("${wallet.base-url}") String baseUrl) {
        this.restTemplate = builder
                .rootUri(baseUrl)
                .setConnectTimeout(Duration.ofSeconds(2))
                .setReadTimeout(Duration.ofSeconds(5))
                .build();
    }

    public WalletBalanceResponse getBalance(Long userId) {
        return DownstreamErrors.call(SERVICE_NAME, () -> restTemplate.getForObject(
                "/api/users/{id}/balance", WalletBalanceResponse.class, userId));
    }

    public WalletBalanceResponse debit(Long userId, BigDecimal amount) {
        return DownstreamErrors.call(SERVICE_NAME, () -> restTemplate.postForObject(
                "/api/users/{id}/debit?amount={amount}", null, WalletBalanceResponse.class,
                userId, amount.toPlainString()));
    }

    public WalletBalanceResponse credit(Long userId, BigDecimal amount) {
        return DownstreamErrors.call(SERVICE_NAME, () -> restTemplate.postForObject(
                "/api/users/{id}/credit?amount={amount}", null, WalletBalanceResponse.class,
                userId, amount.toPlainString()));
    }
}
