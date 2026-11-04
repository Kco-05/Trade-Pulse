package com.tradepulse.portfolio.dto;

import java.math.BigDecimal;

public record WalletBalanceResponse(
        Long userId,
        BigDecimal walletBalance
) {
}
