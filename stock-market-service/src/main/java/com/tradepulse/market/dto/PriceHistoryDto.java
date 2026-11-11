package com.tradepulse.market.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PriceHistoryDto(
        BigDecimal price,
        LocalDateTime recordedAt
) {
}
