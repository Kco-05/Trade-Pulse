package com.tradepulse.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import com.tradepulse.portfolio.repository.TransactionRepository;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class TradeRecorderTest {

    private static final Long USER_ID = 7L;

    @Autowired
    private TradeRecorder tradeRecorder;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Test
    void weightedAverageOnSecondBuy() {
        tradeRecorder.recordBuy(USER_ID, "MSFT", 10, new BigDecimal("100.00"));
        tradeRecorder.recordBuy(USER_ID, "MSFT", 30, new BigDecimal("120.00"));

        Portfolio holding = portfolioRepository.findByUserIdAndTickerSymbol(USER_ID, "MSFT").orElseThrow();
        assertEquals(40, holding.getTotalQuantity());
        assertEquals(new BigDecimal("115.00"), holding.getAverageBuyPrice());
        assertEquals(2, transactionRepository.findByUserIdOrderByTimestampDescTransactionIdDesc(USER_ID).size());
    }
}
