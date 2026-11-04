package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.MarketClient;
import com.tradepulse.ui.dto.StockView;
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
public class MarketBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private final MarketClient marketClient;

    private List<StockView> stocks = List.of();

    protected MarketBean() {
        this(null);
    }

    @Inject
    public MarketBean(MarketClient marketClient) {
        this.marketClient = marketClient;
    }

    @PostConstruct
    void init() {
        refresh();
    }

    public void refresh() {
        try {
            stocks = marketClient.listStocks();
        } catch (ApiException e) {
            stocks = Collections.emptyList();
            FacesMessages.error(e.getMessage());
        }
    }

    public List<StockView> getStocks() {
        return stocks;
    }
}
