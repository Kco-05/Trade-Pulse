package com.tradepulse.portfolio.repository;

import com.tradepulse.portfolio.entity.Portfolio;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {

    Optional<Portfolio> findByUserIdAndTickerSymbol(Long userId, String tickerSymbol);

    List<Portfolio> findByUserIdOrderByTickerSymbolAsc(Long userId);
}
