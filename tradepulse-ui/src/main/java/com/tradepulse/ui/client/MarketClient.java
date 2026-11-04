package com.tradepulse.ui.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.tradepulse.ui.config.ApiConfig;
import com.tradepulse.ui.dto.StockView;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.List;

@ApplicationScoped
public class MarketClient {

    private static final String SERVICE = "Market service";
    private static final TypeReference<List<StockView>> STOCK_LIST = new TypeReference<>() { };

    private final ApiClient apiClient;
    private final ApiConfig config;

    protected MarketClient() {
        this(null, null);
    }

    @Inject
    public MarketClient(ApiClient apiClient, ApiConfig config) {
        this.apiClient = apiClient;
        this.config = config;
    }

    public List<StockView> listStocks() {
        return apiClient.get(SERVICE, config.marketBaseUrl() + "/api/stocks", STOCK_LIST);
    }
}
