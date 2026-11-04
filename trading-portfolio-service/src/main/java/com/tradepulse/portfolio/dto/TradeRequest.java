package com.tradepulse.portfolio.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TradeRequest(
        @NotNull Long userId,
        @NotBlank String tickerSymbol,
        @NotNull @Min(1) @Max(10000) Integer quantity
) {
}
