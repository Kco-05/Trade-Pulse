package com.tradepulse.wallet.service;

import com.tradepulse.wallet.dto.BalanceResponse;
import com.tradepulse.wallet.exception.ConflictException;
import com.tradepulse.wallet.exception.InvalidAmountException;
import java.math.BigDecimal;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;

@Service
public class WalletService {

    private static final int MAX_RETRIES = 3;

    private final WalletBalanceUpdater walletBalanceUpdater;

    public WalletService(WalletBalanceUpdater walletBalanceUpdater) {
        this.walletBalanceUpdater = walletBalanceUpdater;
    }

    public BalanceResponse debit(Long userId, BigDecimal amount) {
        validateAmount(amount);
        return executeWithRetry(() -> walletBalanceUpdater.debitOnce(userId, amount));
    }

    public BalanceResponse credit(Long userId, BigDecimal amount) {
        validateAmount(amount);
        return executeWithRetry(() -> walletBalanceUpdater.creditOnce(userId, amount));
    }

    private BalanceResponse executeWithRetry(BalanceOperation operation) {
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                return operation.execute();
            } catch (ObjectOptimisticLockingFailureException ex) {
                // retry until MAX_RETRIES exhausted
            }
        }
        throw new ConflictException("Wallet update conflict after retries");
    }

    private static void validateAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidAmountException();
        }
    }

    @FunctionalInterface
    private interface BalanceOperation {
        BalanceResponse execute();
    }
}
