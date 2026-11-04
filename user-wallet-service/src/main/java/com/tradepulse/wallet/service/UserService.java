package com.tradepulse.wallet.service;

import com.tradepulse.wallet.dto.BalanceResponse;
import com.tradepulse.wallet.dto.LoginRequest;
import com.tradepulse.wallet.dto.RegisterRequest;
import com.tradepulse.wallet.dto.UserResponse;
import com.tradepulse.wallet.entity.User;
import com.tradepulse.wallet.exception.DuplicateUsernameException;
import com.tradepulse.wallet.exception.InvalidCredentialsException;
import com.tradepulse.wallet.exception.UserNotFoundException;
import com.tradepulse.wallet.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private static final BigDecimal STARTING_BALANCE = new BigDecimal("100000.00");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new DuplicateUsernameException(request.username());
        }
        String hashed = passwordEncoder.encode(request.password());
        User user = new User(request.username(), hashed, STARTING_BALANCE);
        User saved = userRepository.save(user);
        return toUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        return toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public BalanceResponse getBalance(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return toBalanceResponse(user);
    }

    private static UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getUsername(),
                scale(user.getWalletBalance())
        );
    }

    private static BalanceResponse toBalanceResponse(User user) {
        return new BalanceResponse(user.getUserId(), scale(user.getWalletBalance()));
    }

    private static BigDecimal scale(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
}
