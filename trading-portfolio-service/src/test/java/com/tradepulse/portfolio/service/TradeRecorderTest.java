package com.tradepulse.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tradepulse.portfolio.client.WalletApiClient;
import com.tradepulse.portfolio.dto.WalletBalanceResponse;
import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.entity.Transaction;
import com.tradepulse.portfolio.entity.TransactionType;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import com.tradepulse.portfolio.repository.TransactionRepository;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

@SpringBootTest
class TradeRecorderTest {

    @Autowired
    private TradeRecorder tradeRecorder;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @MockBean
    private WalletApiClient walletApiClient;

    @Test
    void weightedAverageOnSecondBuy() {
        Long userId = 7L;
        tradeRecorder.recordBuy(userId, "MSFT", 10, new BigDecimal("100.00"));
        tradeRecorder.recordBuy(userId, "MSFT", 30, new BigDecimal("120.00"));

        Portfolio holding = portfolioRepository.findByUserIdAndTickerSymbol(userId, "MSFT").orElseThrow();
        assertEquals(40, holding.getTotalQuantity());
        assertEquals(new BigDecimal("115.00"), holding.getAverageBuyPrice());
        assertEquals(2, transactionRepository.findByUserIdOrderByTimestampDescTransactionIdDesc(userId).size());
    }

    @Test
    void sellDeletesRowAtZeroQuantity() {
        Long userId = 8L;
        when(walletApiClient.credit(eq(userId), any(BigDecimal.class)))
                .thenReturn(new WalletBalanceResponse(userId, new BigDecimal("100000.00")));

        tradeRecorder.recordBuy(userId, "AAPL", 5, new BigDecimal("190.00"));
        tradeRecorder.recordSell(userId, "AAPL", 5, new BigDecimal("200.00"));

        assertTrue(portfolioRepository.findByUserIdAndTickerSymbol(userId, "AAPL").isEmpty());

        List<Transaction> history = transactionRepository.findByUserIdOrderByTimestampDescTransactionIdDesc(userId);
        assertTrue(history.stream().anyMatch(tx -> tx.getTransactionType() == TransactionType.SELL
                && tx.getTickerSymbol().equals("AAPL")
                && tx.getQuantity() == 5));
        verify(walletApiClient).credit(userId, new BigDecimal("1000.00"));
    }
}
