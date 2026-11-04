package com.tradepulse.market.service;

import com.tradepulse.market.dto.StockDto;
import com.tradepulse.market.dto.StockPriceDto;
import com.tradepulse.market.entity.Stock;
import com.tradepulse.market.exception.StockNotFoundException;
import com.tradepulse.market.repository.StockRepository;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockService {

    private final StockRepository stockRepository;

    public StockService(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
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

    private StockDto toStockDto(Stock stock) {
        return new StockDto(
                stock.getTickerSymbol(),
                stock.getCompanyName(),
                stock.getCurrentPrice()
        );
    }
}
