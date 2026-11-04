package com.tradepulse.ui.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.tradepulse.ui.config.ApiConfig;
import com.tradepulse.ui.dto.HoldingView;
import com.tradepulse.ui.dto.TradeReceipt;
import com.tradepulse.ui.dto.TradeRequest;
import com.tradepulse.ui.dto.TransactionView;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class PortfolioClient {

    private static final String SERVICE = "Trading service";
    private static final TypeReference<List<TransactionView>> TRANSACTION_LIST = new TypeReference<>() { };
    private static final TypeReference<List<HoldingView>> HOLDING_LIST = new TypeReference<>() { };

    private final ApiClient apiClient;
    private final ApiConfig config;

    protected PortfolioClient() {
        this(null, null);
    }

    @Inject
    public PortfolioClient(ApiClient apiClient, ApiConfig config) {
        this.apiClient = apiClient;
        this.config = config;
    }

    public TradeReceipt buy(TradeRequest request) {
        return apiClient.post(SERVICE, url("/api/trade/buy"), request, TradeReceipt.class);
    }

    public TradeReceipt sell(TradeRequest request) {
        return apiClient.post(SERVICE, url("/api/trade/sell"), request, TradeReceipt.class);
    }

    public List<TransactionView> history(Long userId) {
        return apiClient.get(SERVICE, url("/api/trade/history/" + userId), TRANSACTION_LIST);
    }

    public List<HoldingView> portfolio(Long userId) {
        return apiClient.get(SERVICE, url("/api/portfolio/" + userId), HOLDING_LIST);
    }

    private String url(String path) {
        return config.portfolioBaseUrl() + path;
    }
}
