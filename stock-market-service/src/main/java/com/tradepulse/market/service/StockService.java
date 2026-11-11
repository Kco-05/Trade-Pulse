package com.tradepulse.market.service;

import com.tradepulse.market.dto.PriceHistoryDto;
import com.tradepulse.market.dto.StockDto;
import com.tradepulse.market.dto.StockPriceDto;
import com.tradepulse.market.entity.PriceHistory;
import com.tradepulse.market.entity.Stock;
import com.tradepulse.market.exception.StockNotFoundException;
import com.tradepulse.market.repository.PriceHistoryRepository;
import com.tradepulse.market.repository.StockRepository;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    private static final int DEFAULT_HISTORY_LIMIT = 500;
    private static final int MAX_HISTORY_LIMIT = 500;

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public StockService(StockRepository stockRepository, PriceHistoryRepository priceHistoryRepository) {
        this.stockRepository = stockRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Transactional(readOnly = true)
    public List<StockDto> findAll() {
        return stockRepository.findAll().stream()
                .map(this::toStockDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public StockPriceDto findByTicker(String tickerSymbol) {
        String normalized = tickerSymbol.toUpperCase(Locale.ROOT);
        Stock stock = stockRepository.findByTickerSymbol(normalized)
                .orElseThrow(() -> new StockNotFoundException(normalized));
        return new StockPriceDto(stock.getTickerSymbol(), stock.getCurrentPrice());
    }

    @Transactional(readOnly = true)
    public List<PriceHistoryDto> findHistory(String tickerSymbol, int limit) {
        String normalized = tickerSymbol.toUpperCase(Locale.ROOT);
        if (!stockRepository.findByTickerSymbol(normalized).isPresent()) {
            throw new StockNotFoundException(normalized);
        }

        int clamped = clampLimit(limit);
        List<PriceHistory> newestFirst = priceHistoryRepository
                .findByTickerSymbolOrderByRecordedAtDesc(normalized, PageRequest.of(0, clamped));

        List<PriceHistoryDto> ascending = new ArrayList<>(newestFirst.size());
        for (int i = newestFirst.size() - 1; i >= 0; i--) {
            PriceHistory row = newestFirst.get(i);
            ascending.add(new PriceHistoryDto(row.getPrice(), row.getRecordedAt()));
        }
        return Collections.unmodifiableList(ascending);
    }

    private static int clampLimit(int limit) {
        if (limit < 1) {
            return DEFAULT_HISTORY_LIMIT;
        }
        return Math.min(limit, MAX_HISTORY_LIMIT);
    }

    private StockDto toStockDto(Stock stock) {
        return new StockDto(
                stock.getTickerSymbol(),
                stock.getCompanyName(),
                stock.getCurrentPrice()
        );
    }
}
