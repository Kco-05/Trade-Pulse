package com.tradepulse.portfolio.controller;

import com.tradepulse.portfolio.dto.PortfolioItemResponse;
import com.tradepulse.portfolio.service.PortfolioService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    private final PortfolioService portfolioService;

    public PortfolioController(PortfolioService portfolioService) {
        this.portfolioService = portfolioService;
    }

    @GetMapping("/{userId}")
    public List<PortfolioItemResponse> portfolio(@PathVariable("userId") Long userId) {
        return portfolioService.getPortfolio(userId);
    }
}
