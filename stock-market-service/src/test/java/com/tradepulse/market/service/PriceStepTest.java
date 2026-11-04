package com.tradepulse.market.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class PriceStepTest {

    @Test
    void floorsAtOneDollar() {
        BigDecimal result = PriceStep.apply(new BigDecimal("1.00"), -0.02);
        assertEquals(new BigDecimal("1.00"), result);
    }

    @Test
    void floorsWhenPriceWouldDropBelowOne() {
        BigDecimal result = PriceStep.apply(new BigDecimal("1.01"), -0.02);
        assertEquals(new BigDecimal("1.00"), result);
    }

    @Test
    void appliesPositiveBoundAtScaleTwoHalfUp() {
        // 100.00 * 1.02 = 102.00
        BigDecimal result = PriceStep.apply(new BigDecimal("100.00"), 0.02);
        assertEquals(new BigDecimal("102.00"), result);
    }

    @Test
    void appliesNegativeBoundAtScaleTwoHalfUp() {
        // 100.00 * 0.98 = 98.00
        BigDecimal result = PriceStep.apply(new BigDecimal("100.00"), -0.02);
        assertEquals(new BigDecimal("98.00"), result);
    }

    @Test
    void zeroDeltaLeavesPriceUnchangedAtScaleTwo() {
        BigDecimal result = PriceStep.apply(new BigDecimal("190.00"), 0.0);
        assertEquals(new BigDecimal("190.00"), result);
    }

    @Test
    void roundsHalfUpToTwoDecimals() {
        // 10.00 * 1.015 = 10.15
        BigDecimal result = PriceStep.apply(new BigDecimal("10.00"), 0.015);
        assertEquals(new BigDecimal("10.15"), result);
    }
}
