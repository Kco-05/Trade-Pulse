package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.PortfolioClient;
import com.tradepulse.ui.dto.HoldingView;
import com.tradepulse.ui.exception.ApiException;
import jakarta.annotation.PostConstruct;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;

@Named
@ViewScoped
public class PortfolioBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private final PortfolioClient portfolioClient;
    private final UserSession userSession;

    private List<HoldingView> holdings = List.of();
    private BigDecimal totalProfitLoss = BigDecimal.ZERO.setScale(2);
    private BigDecimal totalInvested = BigDecimal.ZERO.setScale(2);
    private BigDecimal currentValue = BigDecimal.ZERO.setScale(2);

    protected PortfolioBean() {
        this(null, null);
    }

    @Inject
    public PortfolioBean(PortfolioClient portfolioClient, UserSession userSession) {
        this.portfolioClient = portfolioClient;
        this.userSession = userSession;
    }

    @PostConstruct
    void init() {
        load();
    }

    public void load() {
        try {
            holdings = portfolioClient.portfolio(userSession.getUserId());
            totalProfitLoss = holdings.stream()
                    .map(HoldingView::profitLoss)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
            totalInvested = holdings.stream()
                    .map(h -> h.averageBuyPrice().multiply(BigDecimal.valueOf(h.totalQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
            currentValue = holdings.stream()
                    .map(h -> h.currentMarketPrice().multiply(BigDecimal.valueOf(h.totalQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .setScale(2, RoundingMode.HALF_UP);
        } catch (ApiException e) {
            holdings = Collections.emptyList();
            totalProfitLoss = BigDecimal.ZERO.setScale(2);
            totalInvested = BigDecimal.ZERO.setScale(2);
            currentValue = BigDecimal.ZERO.setScale(2);
            FacesMessages.error(e.getMessage());
        }
    }

    public List<HoldingView> getHoldings() {
        return holdings;
    }

    public BigDecimal getTotalProfitLoss() {
        return totalProfitLoss;
    }

    public BigDecimal getTotalInvested() {
        return totalInvested;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }
}
