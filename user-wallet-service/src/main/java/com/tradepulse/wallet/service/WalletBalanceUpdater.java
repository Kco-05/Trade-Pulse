package com.tradepulse.wallet.service;

import com.tradepulse.wallet.dto.BalanceResponse;
import com.tradepulse.wallet.entity.User;
import com.tradepulse.wallet.exception.InsufficientFundsException;
import com.tradepulse.wallet.exception.UserNotFoundException;
import com.tradepulse.wallet.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WalletBalanceUpdater {

    private final UserRepository userRepository;

    public WalletBalanceUpdater(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public BalanceResponse debitOnce(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        BigDecimal scaledAmount = amount.setScale(2, RoundingMode.HALF_UP);
        if (user.getWalletBalance().compareTo(scaledAmount) < 0) {
            throw new InsufficientFundsException();
        }
        BigDecimal newBalance = user.getWalletBalance()
                .subtract(scaledAmount)
                .setScale(2, RoundingMode.HALF_UP);
        user.setWalletBalance(newBalance);
        userRepository.save(user);
        return new BalanceResponse(user.getUserId(), newBalance);
    }

    @Transactional
    public BalanceResponse creditOnce(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        BigDecimal scaledAmount = amount.setScale(2, RoundingMode.HALF_UP);
        BigDecimal newBalance = user.getWalletBalance()
                .add(scaledAmount)
                .setScale(2, RoundingMode.HALF_UP);
        user.setWalletBalance(newBalance);
        userRepository.save(user);
        return new BalanceResponse(user.getUserId(), newBalance);
    }
}
