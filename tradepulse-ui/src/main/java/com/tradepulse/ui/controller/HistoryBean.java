package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.PortfolioClient;
import com.tradepulse.ui.dto.TransactionView;
import com.tradepulse.ui.exception.ApiException;
import jakarta.annotation.PostConstruct;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.Serializable;
import java.util.Collections;
import java.util.List;

@Named
@ViewScoped
public class HistoryBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private final PortfolioClient portfolioClient;
    private final UserSession userSession;

    private List<TransactionView> transactions = List.of();

    protected HistoryBean() {
        this(null, null);
    }

    @Inject
    public HistoryBean(PortfolioClient portfolioClient, UserSession userSession) {
        this.portfolioClient = portfolioClient;
        this.userSession = userSession;
    }

    @PostConstruct
    void init() {
        load();
    }

    public void load() {
        try {
            transactions = portfolioClient.history(userSession.getUserId());
        } catch (ApiException e) {
            transactions = Collections.emptyList();
            FacesMessages.error(e.getMessage());
        }
    }

    public List<TransactionView> getTransactions() {
        return transactions;
    }
}
