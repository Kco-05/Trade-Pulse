package com.tradepulse.wallet.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.tradepulse.wallet.dto.BalanceResponse;
import com.tradepulse.wallet.dto.RegisterRequest;
import com.tradepulse.wallet.dto.UserResponse;
import com.tradepulse.wallet.exception.DuplicateUsernameException;
import com.tradepulse.wallet.exception.InsufficientFundsException;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class WalletServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private WalletService walletService;

    @Test
    void debitInsufficientFundsThrows() {
        UserResponse user = userService.register(new RegisterRequest("broke_user", "pass1234"));

        assertThrows(InsufficientFundsException.class,
                () -> walletService.debit(user.userId(), new BigDecimal("100000.01")));
    }

    @Test
    void creditIncreasesBalance() {
        UserResponse user = userService.register(new RegisterRequest("credit_user", "pass1234"));

        BalanceResponse result = walletService.credit(user.userId(), new BigDecimal("250.50"));

        assertEquals(user.userId(), result.userId());
        assertEquals(new BigDecimal("100250.50"), result.walletBalance());
    }

    @Test
    void registerDuplicateUsernameThrows() {
        userService.register(new RegisterRequest("dup_user", "pass1234"));

        assertThrows(DuplicateUsernameException.class,
                () -> userService.register(new RegisterRequest("dup_user", "otherpass")));
    }
}
