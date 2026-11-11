package com.tradepulse.market.config;

import com.tradepulse.market.entity.PriceHistory;
import com.tradepulse.market.entity.Stock;
import com.tradepulse.market.repository.PriceHistoryRepository;
import com.tradepulse.market.repository.StockRepository;
import com.tradepulse.market.service.PriceStep;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PriceSimulator {

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;

    public PriceSimulator(StockRepository stockRepository, PriceHistoryRepository priceHistoryRepository) {
        this.stockRepository = stockRepository;
        this.priceHistoryRepository = priceHistoryRepository;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void tick() {
        LocalDateTime now = LocalDateTime.now();
        List<Stock> stocks = stockRepository.findAll();
        List<PriceHistory> historyRows = new ArrayList<>(stocks.size());

        for (Stock stock : stocks) {
            double delta = ThreadLocalRandom.current().nextDouble(-0.02, 0.02);
            stock.setCurrentPrice(PriceStep.apply(stock.getCurrentPrice(), delta));
            historyRows.add(new PriceHistory(stock.getTickerSymbol(), stock.getCurrentPrice(), now));
        }

        stockRepository.saveAll(stocks);
        priceHistoryRepository.saveAll(historyRows);
        priceHistoryRepository.deleteByRecordedAtBefore(now.minusHours(2));
    }
}
