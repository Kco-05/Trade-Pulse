package com.tradepulse.portfolio.controller;

import com.tradepulse.portfolio.dto.TradeRequest;
import com.tradepulse.portfolio.dto.TradeResponse;
import com.tradepulse.portfolio.dto.TransactionHistoryResponse;
import com.tradepulse.portfolio.service.PortfolioService;
import com.tradepulse.portfolio.service.TradeService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    private final TradeService tradeService;
    private final PortfolioService portfolioService;

    public TradeController(TradeService tradeService, PortfolioService portfolioService) {
        this.tradeService = tradeService;
        this.portfolioService = portfolioService;
    }

    @PostMapping("/buy")
    public TradeResponse buy(@Valid @RequestBody TradeRequest request) {
        return tradeService.buy(request);
    }

    @GetMapping("/history/{userId}")
    public List<TransactionHistoryResponse> history(@PathVariable("userId") Long userId) {
        return portfolioService.getHistory(userId);
    }
}
