package com.tradepulse.market.repository;

import com.tradepulse.market.entity.Stock;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByTickerSymbol(String tickerSymbol);
}
