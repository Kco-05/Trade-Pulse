package com.tradepulse.market.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class PriceStep {

    private static final BigDecimal FLOOR = new BigDecimal("1.00");
    private static final int SCALE = 2;

    private PriceStep() {
    }

    /**
     * newPrice = max(1.00, price × (1 + delta)) at scale 2 HALF_UP.
     */
    public static BigDecimal apply(BigDecimal price, double delta) {
        BigDecimal factor = BigDecimal.ONE.add(BigDecimal.valueOf(delta));
        BigDecimal candidate = price.multiply(factor).setScale(SCALE, RoundingMode.HALF_UP);
        return candidate.max(FLOOR);
    }
}
