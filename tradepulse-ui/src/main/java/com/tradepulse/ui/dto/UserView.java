package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record UserView(Long userId, String username, BigDecimal walletBalance) {
}
