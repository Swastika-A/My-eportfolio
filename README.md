# My ePortfolio (Java + CSS)
URL to access: https://astuti-swastika.netlify.app/

Personal portfolio website for Astuti Swastika, served by a small Java application with a custom HTML and CSS design.

## Tech Stack

- Java 17
- Maven
- Embedded Java HTTP server (`com.sun.net.httpserver.HttpServer`)
- HTML, CSS and a small vanilla JavaScript file (no frameworks or dependencies)
- Netlify for hosting

## Project Structure

- `src/main/java/com/eportfolio/App.java` -> Starts the web server and serves the page, stylesheet, images and CV.
- `src/main/resources/public/index.html` -> Portfolio content.
- `src/main/resources/public/styles.css` -> Site styling (dark "liquid glass" theme).
- `src/main/resources/public/script.js` -> Greeting splash screen, scroll reveals, the self-typing Java code card and the cursor spotlight.
- `src/main/resources/public/images/` -> Project screenshots.
- `src/main/resources/public/cv.pdf` -> Downloadable CV (served from `/cv`).

## Features

- Sections for About, What I Do, Projects, Experience, Skills and Contact.
- Responsive layout for desktop, tablet and mobile, with support for reduced-motion preferences.
- Greeting splash screen ("Hello", "Bula", "नमस्ते" and more) on every page load, skippable with a tap or any key, and turned off for reduced motion.
- `Download CV` button in the hero section.
- Java endpoint `GET /cv` that downloads the CV as `Astuti-Swastika-CV.pdf`.

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

## Deployment

Netlify publishes `src/main/resources/public` directly as a static site (see `netlify.toml`); no Maven build runs there. Every push to `main` updates the live site.

## Adding New Files

The Java server only serves files that are registered in `App.java`. If you add a new image or other asset, add a matching `server.createContext(...)` line so it also works locally.
