# My ePortfolio (Java + CSS)

This is a Java-powered ePortfolio website with a custom CSS design.

## Tech Stack

- Java 17
- Maven
- Embedded Java HTTP server (`com.sun.net.httpserver.HttpServer`)
- HTML + CSS

## Project Structure

- `src/main/java/com/eportfolio/App.java` -> Starts the web server.
- `src/main/resources/public/index.html` -> Portfolio content.
- `src/main/resources/public/styles.css` -> Site styling.
- `src/main/resources/public/script.js` -> Contact form submission logic.
- `src/main/resources/public/cv.txt` -> Downloadable CV file (served from `/cv`).

## Features Added

- `Download CV` button in hero section.
- Java endpoint `GET /cv` to download CV as an attachment.
- Contact form UI in the contact section.
- Java endpoint `POST /contact` that validates and returns JSON.

## Run Locally

1. Open a terminal in this project folder.
2. Run:

```bash
mvn compile exec:java
```

3. Open:

```text
http://localhost:8080
```

## Customize Your Details

Edit `src/main/resources/public/index.html` and replace:

- `Your Name`
- `yourname@example.com`
- `github.com/yourname`
- `linkedin.com/in/yourname`

You can also update project cards and skills to match your real experience.