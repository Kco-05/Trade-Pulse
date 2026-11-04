package com.tradepulse.ui.dto;

import java.math.BigDecimal;

public record TradeReceipt(Long transactionId, String status, BigDecimal executionPrice) {
}
