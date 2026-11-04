package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record BalanceView(Long userId, BigDecimal walletBalance) {
}
