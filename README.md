# Cube Store

Cube Store is a full-stack product gallery for browsing, filtering, saving, and collecting a catalogue of AI-created artisan cubes. It combines an Angular storefront with an Express API, MongoDB persistence, image handling, Stripe integration, authentication, and Docker packaging.

> **Project status:** A public, read-only portfolio build is hosted on the g7 server. Checkout, authentication, and data mutations are intentionally disabled there.

[Live demo](https://cubestore.pesanth.com) | [Technical overview](https://pesanth.com/cubestore) | [Portfolio](https://pesanth.com)

## What this project demonstrates

- Responsive product discovery with search, material, size, price, sorting, result limits, and layout controls.
- Product detail, saved-object, shopping-bag, and quantity-management experiences.
- Intentional loading, empty, unavailable-image, and service-failure states.
- An Express REST API backed by MongoDB and Mongoose.
- Administrative product and image workflows protected by JWT authentication.
- A public read-only mode that blocks checkout, login, and catalogue mutations at the server boundary.
- A guarded GitHub Actions release path that deploys verified main-branch builds to g7 through Cloudflare Tunnel.

## Production architecture

```text
Browser
  |
  v
Cloudflare Tunnel
  |
  v
g7 Express container
  |-- serves the Angular frontend
  |-- serves the catalogue API and images
  |
  v
MongoDB
```

The production origin binds only to the g7 Tailscale address. Cloudflare Tunnel publishes `cubestore.pesanth.com` without opening an inbound router port.

## Repository layout

```text
.github/workflows/       Build, test, and production deployment workflow
deploy/g7/               Reproducible g7 container and deployer configuration
web-store/src/           Angular application
web-store/server/        Express API and data access
web-store/docker-compose.yml
                         Separate frontend and backend local stack
images/                  Project screenshots
```

## Run locally

Prerequisites: Node.js 20, a reachable MongoDB instance, and Stripe test credentials if checkout is enabled.

1. Copy `web-store/backend.env.example` to `web-store/backend.env` and replace every placeholder.
2. Install and start the API from `web-store/server`.
3. Install and start the Angular app from `web-store`.

```bash
cd web-store/server
npm ci
npm start

cd ..
npm ci
npm start
```

The frontend uses `http://localhost:4242` for its API during local development.

The published two-container images can also be started from `web-store` with Docker Compose after the required environment files are configured:

```bash
docker compose up
```

## Verification and deployment

The `Build, Test, and Deploy` workflow builds the Angular app and runs the server safety tests for every relevant pull request and main-branch push.

After a main-branch build passes, the workflow sends the compiled frontend through an authenticated Cloudflare Tunnel path to the g7 deployer. The deployer accepts only the current `main` commit, creates a versioned release, builds the production container, verifies `/healthz`, and restores the previous release if the new container does not become healthy.

The current public catalogue contains 66 MongoDB-backed products. Product images are served from a persistent g7 volume, while missing legacy images use deterministic category-aware fallbacks.

## License

Licensed under the [MIT License](./LICENSE).
