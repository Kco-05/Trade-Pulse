package com.tradepulse.wallet.exception;

public class DuplicateUsernameException extends RuntimeException {

    public DuplicateUsernameException(String username) {
        super("Username already exists: " + username);
    }
}
