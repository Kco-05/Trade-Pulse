package com.tradepulse.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.tradepulse.portfolio.client.MarketApiClient;
import com.tradepulse.portfolio.client.WalletApiClient;
import com.tradepulse.portfolio.dto.StockPriceResponse;
import com.tradepulse.portfolio.dto.TradeRequest;
import com.tradepulse.portfolio.dto.TradeResponse;
import com.tradepulse.portfolio.dto.WalletBalanceResponse;
import com.tradepulse.portfolio.entity.Portfolio;
import com.tradepulse.portfolio.entity.Transaction;
import com.tradepulse.portfolio.exception.DownstreamException;
import com.tradepulse.portfolio.exception.InsufficientHoldingsException;
import com.tradepulse.portfolio.exception.TradeFailedException;
import com.tradepulse.portfolio.repository.PortfolioRepository;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class TradeServiceTest {

    private static final Long USER_ID = 1L;
    private static final BigDecimal PRICE = new BigDecimal("190.55");
    private static final BigDecimal COST_FOR_3 = new BigDecimal("571.65");

    private MarketApiClient marketApiClient;
    private WalletApiClient walletApiClient;
    private TradeRecorder tradeRecorder;
    private PortfolioRepository portfolioRepository;
    private TradeService tradeService;

    @BeforeEach
    void setUp() {
        marketApiClient = mock(MarketApiClient.class);
        walletApiClient = mock(WalletApiClient.class);
        tradeRecorder = mock(TradeRecorder.class);
        portfolioRepository = mock(PortfolioRepository.class);
        tradeService = new TradeService(marketApiClient, walletApiClient, tradeRecorder, portfolioRepository);
        when(marketApiClient.getPrice("AAPL")).thenReturn(new StockPriceResponse("AAPL", PRICE));
    }

    @Test
    void buySuccessReturnsReceipt() {
        Transaction saved = mock(Transaction.class);
        when(saved.getTransactionId()).thenReturn(42L);
        when(walletApiClient.debit(USER_ID, COST_FOR_3))
                .thenReturn(new WalletBalanceResponse(USER_ID, new BigDecimal("99428.35")));
        when(tradeRecorder.recordBuy(USER_ID, "AAPL", 3, PRICE)).thenReturn(saved);

        TradeResponse response = tradeService.buy(new TradeRequest(USER_ID, "aapl", 3));

        verify(walletApiClient).debit(USER_ID, COST_FOR_3);
        assertEquals(42L, response.transactionId());
        assertEquals("SUCCESS", response.status());
        assertEquals(PRICE, response.executionPrice());
    }

    @Test
    void buyRefundsWhenRecordingFails() {
        when(tradeRecorder.recordBuy(USER_ID, "AAPL", 3, PRICE))
                .thenThrow(new IllegalStateException("db down"));

        TradeFailedException ex = assertThrows(TradeFailedException.class,
                () -> tradeService.buy(new TradeRequest(USER_ID, "AAPL", 3)));

        assertEquals("Trade failed, funds refunded", ex.getMessage());
        verify(walletApiClient).debit(USER_ID, COST_FOR_3);
        verify(walletApiClient).credit(USER_ID, COST_FOR_3);
    }

    @Test
    void buyDoesNotRecordWhenDebitFails() {
        when(walletApiClient.debit(USER_ID, COST_FOR_3))
                .thenThrow(new DownstreamException(HttpStatus.BAD_REQUEST, "Insufficient funds"));

        DownstreamException ex = assertThrows(DownstreamException.class,
                () -> tradeService.buy(new TradeRequest(USER_ID, "AAPL", 3)));

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatus());
        verify(tradeRecorder, never()).recordBuy(anyLong(), anyString(), anyInt(), any());
        verify(walletApiClient, never()).credit(anyLong(), any());
    }

    @Test
    void sellOversellingThrowsInsufficientHoldings() {
        when(walletApiClient.getBalance(USER_ID))
                .thenReturn(new WalletBalanceResponse(USER_ID, new BigDecimal("100000.00")));
        Portfolio holding = new Portfolio(USER_ID, "AAPL", 2, new BigDecimal("100.00"));
        when(portfolioRepository.findByUserIdAndTickerSymbol(USER_ID, "AAPL"))
                .thenReturn(Optional.of(holding));

        InsufficientHoldingsException ex = assertThrows(InsufficientHoldingsException.class,
                () -> tradeService.sell(new TradeRequest(USER_ID, "AAPL", 3)));

        assertEquals("Insufficient holdings", ex.getMessage());
        verify(walletApiClient).getBalance(USER_ID);
        verify(tradeRecorder, never()).recordSell(anyLong(), anyString(), anyInt(), any());
        verify(walletApiClient, never()).credit(anyLong(), any());
    }
}
