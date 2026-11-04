package com.tradepulse.market.config;

import com.tradepulse.market.entity.Stock;
import com.tradepulse.market.repository.StockRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class StockDataSeeder implements CommandLineRunner {

    private final StockRepository stockRepository;

    public StockDataSeeder(StockRepository stockRepository) {
        this.stockRepository = stockRepository;
    }

    @Override
    public void run(String... args) {
        if (stockRepository.count() > 0) {
            return;
        }
        stockRepository.saveAll(List.of(
                stock("AAPL", "Apple Inc.", "190.00"),
                stock("MSFT", "Microsoft Corp.", "420.00"),
                stock("NVDA", "NVIDIA Corp.", "880.00"),
                stock("TSLA", "Tesla Inc.", "175.00"),
                stock("AMZN", "Amazon.com Inc.", "180.00"),
                stock("GOOGL", "Alphabet Inc.", "150.00"),
                stock("META", "Meta Platforms Inc.", "480.00"),
                stock("NFLX", "Netflix Inc.", "610.00"),
                stock("AMD", "Advanced Micro Devices", "160.00"),
                stock("INTC", "Intel Corp.", "35.00")
        ));
    }

    private static Stock stock(String ticker, String company, String price) {
        return new Stock(ticker, company, new BigDecimal(price));
    }
}
