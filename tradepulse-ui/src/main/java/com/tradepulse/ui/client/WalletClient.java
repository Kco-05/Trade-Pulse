package com.tradepulse.ui.client;

import com.tradepulse.ui.config.ApiConfig;
import com.tradepulse.ui.dto.BalanceView;
import com.tradepulse.ui.dto.CredentialsRequest;
import com.tradepulse.ui.dto.UserView;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class WalletClient {

    private static final String SERVICE = "Wallet service";

    private final ApiClient apiClient;
    private final ApiConfig config;

    protected WalletClient() {
        this(null, null);
    }

    @Inject
    public WalletClient(ApiClient apiClient, ApiConfig config) {
        this.apiClient = apiClient;
        this.config = config;
    }

    public UserView register(String username, String password) {
        return apiClient.post(SERVICE, url("/register"),
                new CredentialsRequest(username, password), UserView.class);
    }

    public UserView login(String username, String password) {
        return apiClient.post(SERVICE, url("/login"),
                new CredentialsRequest(username, password), UserView.class);
    }

    public BalanceView balance(Long userId) {
        return apiClient.get(SERVICE, url("/" + userId + "/balance"), BalanceView.class);
    }

    private String url(String path) {
        return config.walletBaseUrl() + "/api/users" + path;
    }
}
