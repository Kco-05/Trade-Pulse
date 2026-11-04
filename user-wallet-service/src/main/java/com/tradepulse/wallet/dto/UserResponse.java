package com.tradepulse.wallet.dto;

import java.math.BigDecimal;

public record UserResponse(
        Long userId,
        String username,
        BigDecimal walletBalance
) {
}
