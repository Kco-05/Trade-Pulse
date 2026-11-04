package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.WalletClient;
import com.tradepulse.ui.dto.UserView;
import com.tradepulse.ui.exception.ApiException;
import jakarta.enterprise.context.SessionScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.Serializable;
import java.math.BigDecimal;

@Named
@SessionScoped
public class UserSession implements Serializable {

    private static final long serialVersionUID = 1L;

    private final WalletClient walletClient;

    private Long userId;
    private String username;
    private BigDecimal balance;

    protected UserSession() {
        this(null);
    }

    @Inject
    public UserSession(WalletClient walletClient) {
        this.walletClient = walletClient;
    }

    public void signIn(UserView user) {
        this.userId = user.userId();
        this.username = user.username();
        this.balance = user.walletBalance();
    }

    public void refreshBalance() {
        if (!isLoggedIn()) {
            return;
        }
        try {
            balance = walletClient.balance(userId).walletBalance();
        } catch (ApiException e) {
            FacesMessages.error(e.getMessage());
        }
    }

    public boolean isLoggedIn() {
        return userId != null;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public BigDecimal getBalance() {
        return balance;
    }
}
