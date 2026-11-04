package com.tradepulse.portfolio.service;

import com.tradepulse.portfolio.client.MarketApiClient;
import com.tradepulse.portfolio.client.WalletApiClient;
import com.tradepulse.portfolio.dto.PortfolioItemResponse;
import com.tradepulse.portfolio.dto.TransactionHistoryResponse;
import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.entity.Transaction;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import com.tradepulse.portfolio.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final TransactionRepository transactionRepository;
    private final MarketApiClient marketApiClient;
    private final WalletApiClient walletApiClient;

    public PortfolioService(PortfolioRepository portfolioRepository,
                            TransactionRepository transactionRepository,
                            MarketApiClient marketApiClient,
                            WalletApiClient walletApiClient) {
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.marketApiClient = marketApiClient;
        this.walletApiClient = walletApiClient;
    }

    public List<PortfolioItemResponse> getPortfolio(Long userId) {
        walletApiClient.getBalance(userId);
        return portfolioRepository.findByUserIdOrderByTickerSymbolAsc(userId).stream()
                .map(this::toItem)
                .toList();
    }

    public List<TransactionHistoryResponse> getHistory(Long userId) {
        walletApiClient.getBalance(userId);
        return transactionRepository.findByUserIdOrderByTimestampDescTransactionIdDesc(userId).stream()
                .map(PortfolioService::toHistory)
                .toList();
    }

    private PortfolioItemResponse toItem(Portfolio holding) {
        BigDecimal currentPrice = marketApiClient.getPrice(holding.getTickerSymbol()).currentPrice();
        BigDecimal profitLoss = currentPrice.subtract(holding.getAverageBuyPrice())
                .multiply(BigDecimal.valueOf(holding.getTotalQuantity()))
                .setScale(2, RoundingMode.HALF_UP);
        return new PortfolioItemResponse(holding.getTickerSymbol(), holding.getTotalQuantity(),
                holding.getAverageBuyPrice(), currentPrice, profitLoss);
    }

    private static TransactionHistoryResponse toHistory(Transaction transaction) {
        return new TransactionHistoryResponse(transaction.getTransactionId(), transaction.getTickerSymbol(),
                transaction.getTransactionType().name(), transaction.getQuantity(),
                transaction.getExecutionPrice(), transaction.getTimestamp());
    }
}
