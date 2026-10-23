# Prathmesh Kanure

An interactive portfolio exploring software, systems and computational physics.

Live site: https://prathmax45.github.io

## Local development

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

## Checks and production build

```sh
npm test
npm run build
```

Next.js exports static pages and assets to `out/`. The physics models run in the browser.

## Deployment

Push to `main` to run the GitHub Pages workflow. It installs dependencies, runs the model tests, builds the site and publishes `out/`. Repository Settings → Pages uses **GitHub Actions** as the source.

To add a custom domain later, configure it under Settings → Pages, set the registrar's DNS records for GitHub Pages, enable HTTPS and update `metadataBase` in `app/layout.tsx` to that domain.

## Content and credits

Profile and project content is in `content/projects.ts`. The home page uses an orbital sandbox, spring-linked packet network, byte register, N-body gravity, classical waves and double pendulums. These are educational browser models, separate from the linked C/C++/Python repositories.

Photography and footage are from NASA, Wikimedia Commons and Unsplash. Full attribution and license links are displayed at `/credits/`. Locally hosted fonts include their SIL Open Font License files. No AI-generated images are used.
