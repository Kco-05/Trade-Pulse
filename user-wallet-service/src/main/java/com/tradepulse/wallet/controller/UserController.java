package com.tradepulse.wallet.controller;

import com.tradepulse.wallet.dto.BalanceResponse;
import com.tradepulse.wallet.dto.LoginRequest;
import com.tradepulse.wallet.dto.RegisterRequest;
import com.tradepulse.wallet.dto.UserResponse;
import com.tradepulse.wallet.service.UserService;
import com.tradepulse.wallet.service.WalletService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final WalletService walletService;

    public UserController(UserService userService, WalletService walletService) {
        this.userService = userService;
        this.walletService = walletService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public UserResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/{id}/balance")
    public BalanceResponse getBalance(@PathVariable("id") Long id) {
        return userService.getBalance(id);
    }

    @PostMapping("/{id}/debit")
    public BalanceResponse debit(
            @PathVariable("id") Long id,
            @RequestParam("amount") BigDecimal amount) {
        return walletService.debit(id, amount);
    }

    @PostMapping("/{id}/credit")
    public BalanceResponse credit(
            @PathVariable("id") Long id,
            @RequestParam("amount") BigDecimal amount) {
        return walletService.credit(id, amount);
    }
}
