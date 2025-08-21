# News Hub - Nuxt 3 News Aggregation Platform

A modern news aggregation platform built with Nuxt 3, featuring authentication, media platform browsing, and news article display.

## Features

- 🔐 **Authentication System**: User login/logout with JWT tokens
- 📰 **Media Platforms**: Browse CNN, BBC, TechCrunch, Reuters, The Guardian, Wired
- 📱 **News Articles**: Read headlines, summaries, and access original articles
- 🎨 **Modern UI**: Responsive design with Tailwind CSS
- ⚡ **TypeScript**: Full type safety and IntelliSense support
- 🔄 **Hot Reload**: Instant updates during development

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

### Windows (PowerShell/Command Prompt)
```bash
npx nuxt dev --host 0.0.0.0
```

### Unix/Linux/macOS
```bash
npm run dev
```

### Alternative Commands
```bash
# Local only (localhost)
npx nuxt dev

# Custom port
npx nuxt dev --port 3001

# Network accessible
npx nuxt dev --host 0.0.0.0
```

## Demo Access

- **Login**: Use any email and password (demo mode)
- **Features**: Browse platforms, read news articles, responsive design

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Technology Stack

- **Frontend**: Nuxt 3 (Vue.js 3)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide Vue Next
- **Build Tool**: Nuxt's built-in build system

## Project Structure

```
project/
├── app.vue                 # Main app wrapper with auth initialization
├── composables/            # Reusable logic (useAuth)
├── middleware/             # Route protection (auth.ts)
├── pages/                  # Vue pages with file-based routing
├── utils/                  # API client with mock data
├── assets/css/            # Global styles and Tailwind
└── server/                # Server-side configuration
```

Check out the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.
