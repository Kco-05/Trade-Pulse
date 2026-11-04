package com.tradepulse.market.controller;

import com.tradepulse.market.dto.StockDto;
import com.tradepulse.market.dto.StockPriceDto;
import com.tradepulse.market.service.StockService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping
    public List<StockDto> listStocks() {
        return stockService.findAll();
    }

    @GetMapping("/{tickerSymbol}")
    public StockPriceDto getStock(@PathVariable String tickerSymbol) {
        return stockService.findByTicker(tickerSymbol);
    }
}
