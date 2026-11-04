package com.tradepulse.market.config;

import com.tradepulse.market.entity.Stock;
import com.tradepulse.market.repository.StockRepository;
import com.tradepulse.market.service.PriceStep;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class PriceSimulator {

    private final StockRepository stockRepository;

    public PriceSimulator(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Scheduled(fixedRate = 5000)
    @Transactional
    public void tick() {
        List<Stock> stocks = stockRepository.findAll();
        for (Stock stock : stocks) {
            double delta = ThreadLocalRandom.current().nextDouble(-0.02, 0.02);
            stock.setCurrentPrice(PriceStep.apply(stock.getCurrentPrice(), delta));
        }
        stockRepository.saveAll(stocks);
    }
}
