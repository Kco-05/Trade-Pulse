package com.tradepulse.market.repository;

import com.tradepulse.market.entity.PriceHistory;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    List<PriceHistory> findByTickerSymbolOrderByRecordedAtDesc(String tickerSymbol, Pageable pageable);

    void deleteByRecordedAtBefore(LocalDateTime cutoff);
}
