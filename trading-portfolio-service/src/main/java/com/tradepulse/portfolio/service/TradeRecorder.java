package com.tradepulse.portfolio.service;

import com.tradepulse.portfolio.client.WalletApiClient;
import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.entity.Transaction;
import com.tradepulse.portfolio.entity.TransactionType;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import com.tradepulse.portfolio.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TradeRecorder {

    private final TransactionRepository transactionRepository;
    private final PortfolioRepository portfolioRepository;
    private final WalletApiClient walletApiClient;

    public TradeRecorder(TransactionRepository transactionRepository,
                         PortfolioRepository portfolioRepository,
                         WalletApiClient walletApiClient) {
        this.transactionRepository = transactionRepository;
        this.portfolioRepository = portfolioRepository;
        this.walletApiClient = walletApiClient;
    }

    @Transactional
    public Transaction recordBuy(Long userId, String tickerSymbol, int quantity, BigDecimal price) {
        Transaction transaction = transactionRepository.save(new Transaction(
                userId, tickerSymbol, TransactionType.BUY, quantity, price, LocalDateTime.now()));

        Portfolio holding = portfolioRepository.findByUserIdAndTickerSymbol(userId, tickerSymbol)
                .map(existing -> addToHolding(existing, quantity, price))
                .orElseGet(() -> new Portfolio(userId, tickerSymbol, quantity, price));
        portfolioRepository.save(holding);

        return transaction;
    }

    @Transactional
    public Transaction recordSell(Long userId, String tickerSymbol, int quantity, BigDecimal price) {
        Transaction transaction = transactionRepository.save(new Transaction(
                userId, tickerSymbol, TransactionType.SELL, quantity, price, LocalDateTime.now()));

        Portfolio holding = portfolioRepository.findByUserIdAndTickerSymbol(userId, tickerSymbol)
                .orElseThrow();
        int newQuantity = holding.getTotalQuantity() - quantity;
        if (newQuantity == 0) {
            portfolioRepository.delete(holding);
        } else {
            holding.setTotalQuantity(newQuantity);
            portfolioRepository.save(holding);
        }

        BigDecimal proceeds = price.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
        walletApiClient.credit(userId, proceeds);

        return transaction;
    }

    private static Portfolio addToHolding(Portfolio holding, int quantity, BigDecimal price) {
        int oldQuantity = holding.getTotalQuantity();
        int newQuantity = oldQuantity + quantity;
        BigDecimal totalCost = holding.getAverageBuyPrice().multiply(BigDecimal.valueOf(oldQuantity))
                .add(price.multiply(BigDecimal.valueOf(quantity)));
        holding.setTotalQuantity(newQuantity);
        holding.setAverageBuyPrice(totalCost.divide(BigDecimal.valueOf(newQuantity), 2, RoundingMode.HALF_UP));
        return holding;
    }
}
