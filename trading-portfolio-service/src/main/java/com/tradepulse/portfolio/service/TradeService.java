package com.tradepulse.portfolio.service;

import com.tradepulse.portfolio.client.MarketApiClient;
import com.tradepulse.portfolio.client.WalletApiClient;
import com.tradepulse.portfolio.dto.TradeRequest;
import com.tradepulse.portfolio.dto.TradeResponse;
import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.entity.Transaction;
import com.tradepulse.portfolio.exception.InsufficientHoldingsException;
import com.tradepulse.portfolio.exception.TradeFailedException;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class TradeService {

    private static final Logger log = LoggerFactory.getLogger(TradeService.class);
    private static final String STATUS_SUCCESS = "SUCCESS";

    private final MarketApiClient marketApiClient;
    private final WalletApiClient walletApiClient;
    private final TradeRecorder tradeRecorder;
    private final PortfolioRepository portfolioRepository;

    public TradeService(MarketApiClient marketApiClient, WalletApiClient walletApiClient,
                        TradeRecorder tradeRecorder, PortfolioRepository portfolioRepository) {
        this.marketApiClient = marketApiClient;
        this.walletApiClient = walletApiClient;
        this.tradeRecorder = tradeRecorder;
        this.portfolioRepository = portfolioRepository;
    }

    public TradeResponse buy(TradeRequest request) {
        Long userId = request.userId();
        int quantity = request.quantity();
        String ticker = request.tickerSymbol().trim().toUpperCase(Locale.ROOT);

        BigDecimal price = marketApiClient.getPrice(ticker).currentPrice();
        BigDecimal cost = price.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);

        walletApiClient.debit(userId, cost);

        Transaction transaction;
        try {
            transaction = tradeRecorder.recordBuy(userId, ticker, quantity, price);
        } catch (RuntimeException ex) {
            log.warn("Recording BUY failed for userId={} ticker={}; refunding {}", userId, ticker, cost, ex);
            refund(userId, cost);
            throw new TradeFailedException("Trade failed, funds refunded");
        }

        return new TradeResponse(transaction.getTransactionId(), STATUS_SUCCESS, price);
    }

    public TradeResponse sell(TradeRequest request) {
        Long userId = request.userId();
        int quantity = request.quantity();
        String ticker = request.tickerSymbol().trim().toUpperCase(Locale.ROOT);

        BigDecimal price = marketApiClient.getPrice(ticker).currentPrice();

        Portfolio holding = portfolioRepository.findByUserIdAndTickerSymbol(userId, ticker)
                .orElseThrow(InsufficientHoldingsException::new);
        if (holding.getTotalQuantity() < quantity) {
            throw new InsufficientHoldingsException();
        }

        Transaction transaction = tradeRecorder.recordSell(userId, ticker, quantity, price);
        return new TradeResponse(transaction.getTransactionId(), STATUS_SUCCESS, price);
    }

    private void refund(Long userId, BigDecimal amount) {
        try {
            walletApiClient.credit(userId, amount);
            log.info("Refunded {} to userId={}", amount, userId);
        } catch (RuntimeException ex) {
            log.error("REFUND FAILED for userId={} amount={}", userId, amount, ex);
        }
    }
}
