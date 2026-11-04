package com.tradepulse.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;

@Entity
@Table(name = "portfolios",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "ticker_symbol"}))
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "portfolio_id")
    private Long portfolioId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "ticker_symbol", length = 10, nullable = false)
    private String tickerSymbol;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "average_buy_price", precision = 10, scale = 2, nullable = false)
    private BigDecimal averageBuyPrice;

    protected Portfolio() {
    }

    public Portfolio(Long userId, String tickerSymbol, Integer totalQuantity, BigDecimal averageBuyPrice) {
        this.userId = userId;
        this.tickerSymbol = tickerSymbol;
        this.totalQuantity = totalQuantity;
        this.averageBuyPrice = averageBuyPrice;
    }

    public Long getPortfolioId() {
        return portfolioId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public Integer getTotalQuantity() {
        return totalQuantity;
    }

    public void setTotalQuantity(Integer totalQuantity) {
        this.totalQuantity = totalQuantity;
    }

    public BigDecimal getAverageBuyPrice() {
        return averageBuyPrice;
    }

    public void setAverageBuyPrice(BigDecimal averageBuyPrice) {
        this.averageBuyPrice = averageBuyPrice;
    }
}
