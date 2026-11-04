package com.tradepulse.ui.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.tradepulse.ui.exception.ApiException;
import jakarta.enterprise.context.ApplicationScoped;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.logging.Level;
import java.util.logging.Logger;

@ApplicationScoped
public class ApiClient {

    private static final Logger LOG = Logger.getLogger(ApiClient.class.getName());
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(2);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(5);
    private static final int SERVICE_UNAVAILABLE = 503;
    private static final String JSON = "application/json";

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(CONNECT_TIMEOUT)
            .build();

    private final ObjectMapper mapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    public <T> T get(String service, String url, Class<T> type) {
        return send(service, request(url).GET().build(), mapper.constructType(type));
    }

    public <T> T get(String service, String url, TypeReference<T> type) {
        return send(service, request(url).GET().build(), mapper.constructType(type));
    }

    public <T> T post(String service, String url, Object body, Class<T> type) {
        HttpRequest request = request(url)
                .header("Content-Type", JSON)
                .POST(HttpRequest.BodyPublishers.ofString(toJson(body)))
                .build();
        return send(service, request, mapper.constructType(type));
    }

    public <T> T post(String service, String url, Class<T> type) {
        HttpRequest request = request(url).POST(HttpRequest.BodyPublishers.noBody()).build();
        return send(service, request, mapper.constructType(type));
    }

    private HttpRequest.Builder request(String url) {
        return HttpRequest.newBuilder(URI.create(url))
                .timeout(READ_TIMEOUT)
                .header("Accept", JSON);
    }

    private <T> T send(String service, HttpRequest request, JavaType type) {
        HttpResponse<String> response;
        try {
            response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        } catch (IOException e) {
            LOG.log(Level.WARNING, "{0} unreachable at {1}: {2}",
                    new Object[] {service, request.uri(), e.toString()});
            throw unavailable(service);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw unavailable(service);
        }

        if (response.statusCode() / 100 != 2) {
            throw new ApiException(response.statusCode(), errorMessage(response));
        }
        try {
            return mapper.readValue(response.body(), type);
        } catch (JsonProcessingException e) {
            throw new ApiException(SERVICE_UNAVAILABLE, service + " returned an unreadable response");
        }
    }

    private String errorMessage(HttpResponse<String> response) {
        try {
            JsonNode error = mapper.readTree(response.body()).get("error");
            if (error != null && !error.asText().isBlank()) {
                return error.asText();
            }
        } catch (JsonProcessingException ignored) {
            // Non-JSON error bodies fall through to the generic message.
        }
        return "Request failed with status " + response.statusCode();
    }

    private String toJson(Object body) {
        try {
            return mapper.writeValueAsString(body);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Could not serialize request body", e);
        }
    }

    private static ApiException unavailable(String service) {
        return new ApiException(SERVICE_UNAVAILABLE, service + " is unavailable. Please try again shortly.");
    }
}
