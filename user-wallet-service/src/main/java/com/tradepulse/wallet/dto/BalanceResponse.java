package com.tradepulse.wallet.dto;

import java.math.BigDecimal;

public record BalanceResponse(
        Long userId,
        BigDecimal walletBalance
) {
}
