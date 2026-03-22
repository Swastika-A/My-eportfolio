package com.eportfolio;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Executors;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

public class App {

    public static void main(String[] args) throws IOException {
        int port = 8080;
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        server.createContext("/", new ResourceHandler("/public/index.html", "text/html; charset=utf-8"));
        server.createContext("/styles.css", new ResourceHandler("/public/styles.css", "text/css; charset=utf-8"));
        server.createContext("/profile-photo.jpg", new ResourceHandler("/public/profile-photo.jpg", "image/jpeg"));
        server.createContext("/my-photo.jpg", new ResourceHandler("/public/my-photo.jpg", "image/jpeg"));
        server.createContext("/images/bank.png", new ResourceHandler("/public/images/bank.png", "image/png"));
        server.createContext("/images/leave-system.png", new ResourceHandler("/public/images/leave-system.png", "image/png"));
        server.createContext("/images/eportfolio.png", new ResourceHandler("/public/images/eportfolio.png", "image/png"));
        server.createContext("/cv", new DownloadHandler("/public/cv.pdf", "application/pdf", "Astuti-Swastika-CV.pdf"));

        server.setExecutor(Executors.newCachedThreadPool());
        server.start();

        System.out.println("ePortfolio running at http://localhost:" + port);
    }

    private static final class ResourceHandler implements HttpHandler {
        private final String resourcePath;
        private final String contentType;

        private ResourceHandler(String resourcePath, String contentType) {
            this.resourcePath = resourcePath;
            this.contentType = contentType;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendTextResponse(exchange, 405, "Method Not Allowed");
                return;
            }

            try (InputStream in = App.class.getResourceAsStream(resourcePath)) {
                if (in == null) {
                    sendTextResponse(exchange, 404, "Not Found");
                    return;
                }

                byte[] bytes = in.readAllBytes();
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.sendResponseHeaders(200, bytes.length);

                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(bytes);
                }
            }
        }

        private static void sendTextResponse(HttpExchange exchange, int status, String message) throws IOException {
            byte[] body = message.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
            exchange.sendResponseHeaders(status, body.length);

            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        }
    }

    private static final class DownloadHandler implements HttpHandler {
        private final String resourcePath;
        private final String contentType;
        private final String filename;

        private DownloadHandler(String resourcePath, String contentType, String filename) {
            this.resourcePath = resourcePath;
            this.contentType = contentType;
            this.filename = filename;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"ok\":false,\"message\":\"Method Not Allowed\"}");
                return;
            }

            try (InputStream in = App.class.getResourceAsStream(resourcePath)) {
                if (in == null) {
                    sendJsonResponse(exchange, 404, "{\"ok\":false,\"message\":\"CV file not found\"}");
                    return;
                }

                byte[] bytes = in.readAllBytes();
                exchange.getResponseHeaders().set("Content-Type", contentType);
                exchange.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"" + filename + "\"");
                exchange.sendResponseHeaders(200, bytes.length);

                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(bytes);
                }
            }
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, int status, String jsonBody) throws IOException {
        byte[] body = jsonBody.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.sendResponseHeaders(status, body.length);

        try (OutputStream out = exchange.getResponseBody()) {
            out.write(body);
        }
    }
}
