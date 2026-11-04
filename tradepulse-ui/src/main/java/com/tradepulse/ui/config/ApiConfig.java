package com.tradepulse.ui.config;

import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.Properties;

@ApplicationScoped
public class ApiConfig {

    private static final String PROPERTIES_FILE = "application.properties";

    private String marketBaseUrl;
    private String walletBaseUrl;
    private String portfolioBaseUrl;

    @PostConstruct
    void load() {
        Properties properties = new Properties();
        try (InputStream in = Thread.currentThread().getContextClassLoader()
                .getResourceAsStream(PROPERTIES_FILE)) {
            if (in == null) {
                throw new IllegalStateException(PROPERTIES_FILE + " not found on classpath");
            }
            properties.load(in);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read " + PROPERTIES_FILE, e);
        }
        marketBaseUrl = required(properties, "market.base-url");
        walletBaseUrl = required(properties, "wallet.base-url");
        portfolioBaseUrl = required(properties, "portfolio.base-url");
    }

    private static String required(Properties properties, String key) {
        String value = properties.getProperty(key);
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Missing property " + key);
        }
        return value.trim();
    }

    public String marketBaseUrl() {
        return marketBaseUrl;
    }

    public String walletBaseUrl() {
        return walletBaseUrl;
    }

    public String portfolioBaseUrl() {
        return portfolioBaseUrl;
    }
}
