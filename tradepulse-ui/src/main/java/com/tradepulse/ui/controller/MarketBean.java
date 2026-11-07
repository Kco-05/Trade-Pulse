package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.MarketClient;
import com.tradepulse.ui.dto.StockView;
import com.tradepulse.ui.exception.ApiException;
import jakarta.annotation.PostConstruct;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Named
@ViewScoped
public class MarketBean implements Serializable {

    private static final long serialVersionUID = 1L;

    private final MarketClient marketClient;

    private List<StockView> stocks = List.of();
    private boolean marketUnavailable;

    private final Map<String, BigDecimal> previousPrices = new HashMap<>();
    private final Map<String, BigDecimal> initialPrices = new HashMap<>();
    private final Map<String, String> priceChangeIndicators = new HashMap<>();
    private final Map<String, BigDecimal> priceChangePercentages = new HashMap<>();
    private final Map<String, String> priceChangeClasses = new HashMap<>();

    private String topGainerTicker;
    private BigDecimal topGainerPercentage;
    private String topLoserTicker;
    private BigDecimal topLoserPercentage;

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
            List<StockView> newStocks = marketClient.listStocks();
            this.marketUnavailable = false;
            updatePricesAndStats(newStocks);
            this.stocks = newStocks;
        } catch (ApiException e) {
            this.marketUnavailable = true;
            this.stocks = Collections.emptyList();
            FacesMessages.error(e.getMessage());
        } catch (Exception e) {
            this.marketUnavailable = true;
            this.stocks = Collections.emptyList();
            FacesMessages.error("Market service is unavailable: " + e.getMessage());
        }
    }

    private void updatePricesAndStats(List<StockView> newStocks) {
        if (newStocks == null || newStocks.isEmpty()) {
            return;
        }

        // 1. Compute price-change indicators from prior polls
        for (StockView stock : newStocks) {
            String ticker = stock.tickerSymbol();
            BigDecimal currentPrice = stock.currentPrice();

            BigDecimal prevPrice = previousPrices.get(ticker);
            if (prevPrice != null && prevPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal diff = currentPrice.subtract(prevPrice);
                BigDecimal pctChange = diff.multiply(BigDecimal.valueOf(100))
                        .divide(prevPrice, 2, RoundingMode.HALF_UP);
                priceChangePercentages.put(ticker, pctChange);

                if (diff.compareTo(BigDecimal.ZERO) > 0) {
                    priceChangeIndicators.put(ticker, "▲ +" + pctChange.toPlainString() + "%");
                    priceChangeClasses.put(ticker, "tp-pl-positive");
                } else if (diff.compareTo(BigDecimal.ZERO) < 0) {
                    priceChangeIndicators.put(ticker, "▼ " + pctChange.toPlainString() + "%");
                    priceChangeClasses.put(ticker, "tp-pl-negative");
                } else {
                    priceChangeIndicators.put(ticker, "― 0.00%");
                    priceChangeClasses.put(ticker, "");
                }
            } else {
                priceChangeIndicators.put(ticker, "― 0.00%");
                priceChangePercentages.put(ticker, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                priceChangeClasses.put(ticker, "");
            }

            previousPrices.put(ticker, currentPrice);
            initialPrices.putIfAbsent(ticker, currentPrice);
        }

        // 2. Track Top Gainer and Top Loser tickers since page load
        String bestGainer = null;
        BigDecimal maxGain = null;
        String worstLoser = null;
        BigDecimal maxLoss = null;

        for (StockView stock : newStocks) {
            String ticker = stock.tickerSymbol();
            BigDecimal initPrice = initialPrices.get(ticker);
            if (initPrice != null && initPrice.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal diffFromInitial = stock.currentPrice().subtract(initPrice);
                BigDecimal pctSinceLoad = diffFromInitial.multiply(BigDecimal.valueOf(100))
                        .divide(initPrice, 2, RoundingMode.HALF_UP);

                if (maxGain == null || pctSinceLoad.compareTo(maxGain) > 0) {
                    maxGain = pctSinceLoad;
                    bestGainer = ticker;
                }
                if (maxLoss == null || pctSinceLoad.compareTo(maxLoss) < 0) {
                    maxLoss = pctSinceLoad;
                    worstLoser = ticker;
                }
            }
        }

        this.topGainerTicker = bestGainer;
        this.topGainerPercentage = maxGain;
        this.topLoserTicker = worstLoser;
        this.topLoserPercentage = maxLoss;
    }

    public List<StockView> getStocks() {
        return stocks;
    }

    public boolean isMarketUnavailable() {
        return marketUnavailable;
    }

    public boolean getMarketUnavailable() {
        return marketUnavailable;
    }

    public void setMarketUnavailable(boolean marketUnavailable) {
        this.marketUnavailable = marketUnavailable;
    }

    public Map<String, BigDecimal> getPreviousPrices() {
        return previousPrices;
    }

    public Map<String, String> getPriceChangeIndicators() {
        return priceChangeIndicators;
    }

    public Map<String, BigDecimal> getPriceChangePercentages() {
        return priceChangePercentages;
    }

    public Map<String, String> getPriceChangeClasses() {
        return priceChangeClasses;
    }

    public String getPriceChangeIndicator(String ticker) {
        return priceChangeIndicators.getOrDefault(ticker, "― 0.00%");
    }

    public BigDecimal getPriceChangePercentage(String ticker) {
        return priceChangePercentages.getOrDefault(ticker, BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    public String getPriceChangeClass(String ticker) {
        return priceChangeClasses.getOrDefault(ticker, "");
    }

    public BigDecimal getPreviousPrice(String ticker) {
        return previousPrices.get(ticker);
    }

    public String getTopGainerTicker() {
        return topGainerTicker != null ? topGainerTicker : "N/A";
    }

    public String getTopGainer() {
        return getTopGainerTicker();
    }

    public BigDecimal getTopGainerPercentage() {
        return topGainerPercentage;
    }

    public String getTopGainerChange() {
        if (topGainerPercentage == null) {
            return "0.00%";
        }
        return (topGainerPercentage.signum() > 0 ? "+" : "") + topGainerPercentage.toPlainString() + "%";
    }

    public String getTopLoserTicker() {
        return topLoserTicker != null ? topLoserTicker : "N/A";
    }

    public String getTopLoser() {
        return getTopLoserTicker();
    }

    public BigDecimal getTopLoserPercentage() {
        return topLoserPercentage;
    }

    public String getTopLoserChange() {
        if (topLoserPercentage == null) {
            return "0.00%";
        }
        return (topLoserPercentage.signum() > 0 ? "+" : "") + topLoserPercentage.toPlainString() + "%";
    }
}
