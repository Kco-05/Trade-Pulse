package com.tradepulse.ui.controller;

import com.tradepulse.ui.client.PortfolioClient;
import com.tradepulse.ui.dto.StockView;
import com.tradepulse.ui.dto.TradeReceipt;
import com.tradepulse.ui.dto.TradeRequest;
import com.tradepulse.ui.exception.ApiException;
import jakarta.faces.FacesException;
import jakarta.faces.application.FacesMessage;
import jakarta.faces.context.FacesContext;
import jakarta.faces.view.ViewScoped;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import java.io.IOException;
import java.io.Serializable;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.primefaces.PrimeFaces;

@Named
@ViewScoped
public class TradeBean implements Serializable {

    private static final long serialVersionUID = 1L;
    private static final int MIN_QUANTITY = 1;
    private static final int MAX_QUANTITY = 10000;

    private final PortfolioClient portfolioClient;
    private final UserSession userSession;

    private boolean dialogVisible;
    private boolean buyMode = true;
    private String tickerSymbol;
    private String companyName;
    private BigDecimal currentPrice;
    private int quantity = MIN_QUANTITY;

    protected TradeBean() {
        this(null, null);
    }

    @Inject
    public TradeBean(PortfolioClient portfolioClient, UserSession userSession) {
        this.portfolioClient = portfolioClient;
        this.userSession = userSession;
    }

    public void openBuy(StockView stock) {
        open(stock, true);
    }

    public void openSell(StockView stock) {
        open(stock, false);
    }

    public void confirm() {
        if (userSession == null || userSession.getUserId() == null) {
            redirectToLoginWithNotice();
            return;
        }

        if (quantity < MIN_QUANTITY || quantity > MAX_QUANTITY) {
            FacesMessages.error("Quantity must be between 1 and 10000.");
            return;
        }
        TradeRequest request = new TradeRequest(userSession.getUserId(), tickerSymbol, quantity);
        try {
            TradeReceipt receipt = buyMode
                    ? portfolioClient.buy(request)
                    : portfolioClient.sell(request);
            userSession.refreshBalance();
            FacesMessages.success(buyMode
                    ? "Bought " + quantity + " " + tickerSymbol + " at $" + receipt.executionPrice()
                    : "Sold " + quantity + " " + tickerSymbol + " at $" + receipt.executionPrice());
            close();
            PrimeFaces.current().ajax().addCallbackParam("tradeCompleted", true);
        } catch (ApiException e) {
            FacesMessages.error(e.getMessage() == null || e.getMessage().isBlank()
                    ? "Trade failed (" + e.getStatus() + ")"
                    : e.getMessage());
        }
    }

    public void cancel() {
        close();
    }

    private void open(StockView stock, boolean buy) {
        if (userSession == null || userSession.getUserId() == null) {
            redirectToLoginWithNotice();
            return;
        }

        this.buyMode = buy;
        this.tickerSymbol = stock.tickerSymbol();
        this.companyName = stock.companyName();
        this.currentPrice = stock.currentPrice();
        this.quantity = MIN_QUANTITY;
        this.dialogVisible = true;
    }

    private void redirectToLoginWithNotice() {
        FacesContext facesContext = FacesContext.getCurrentInstance();
        facesContext.addMessage(null,
                new FacesMessage(FacesMessage.SEVERITY_WARN, "Please log in to execute trades", null));
        facesContext.getExternalContext().getFlash().setKeepMessages(true);
        try {
            String contextPath = facesContext.getExternalContext().getRequestContextPath();
            String loginUrl = (contextPath == null || contextPath.isEmpty() || "/".equals(contextPath))
                    ? "/login.xhtml"
                    : contextPath + "/login.xhtml";
            facesContext.getExternalContext().redirect(loginUrl);
        } catch (IOException e) {
            throw new FacesException("Failed to redirect to login.xhtml", e);
        }
    }

    private void close() {
        dialogVisible = false;
        quantity = MIN_QUANTITY;
    }

    public BigDecimal getEstimatedTotal() {
        if (currentPrice == null || quantity <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return currentPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal getTotal() {
        return getEstimatedTotal();
    }

    public boolean isDialogVisible() {
        return dialogVisible;
    }

    public void setDialogVisible(boolean dialogVisible) {
        this.dialogVisible = dialogVisible;
    }

    public boolean isBuyMode() {
        return buyMode;
    }

    public String getTickerSymbol() {
        return tickerSymbol;
    }

    public String getCompanyName() {
        return companyName;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public String getDialogHeader() {
        return (buyMode ? "Buy " : "Sell ") + (tickerSymbol == null ? "" : tickerSymbol);
    }
}
