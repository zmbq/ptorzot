# PtorZot PWA

A Progressive Web App version of the PtorZot mathematical puzzle game, built with Svelte.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (currently using Node 24)
- pnpm package manager

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### Build

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Type Checking

```bash
pnpm check
```

### Testing

```bash
pnpm test
```

## 📁 Project Structure

```
PWA/
├── public/              # Static assets
│   ├── assets/          # Images, fonts, etc.
│   └── icons/           # PWA icons
├── src/
│   ├── actions/         # Svelte actions (shake, vibrate, etc.)
│   ├── components/      # Reusable Svelte components
│   ├── game-engine/     # Pure TypeScript game logic
│   │   └── levels/      # Level implementations
│   ├── routes/          # Page components
│   ├── stores/          # Svelte stores (state management)
│   ├── styles/          # Global CSS
│   ├── utils/           # Utility functions
│   ├── App.svelte       # Root component
│   └── main.ts          # Entry point
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## 🎮 Game Features

- **Mathematical Puzzles**: Reach a target number using 5 given numbers
- **Three Difficulty Levels**: Easy, Medium, Hard
- **PWA Features**: 
  - Offline support
  - Install to home screen
  - Native-like experience
- **Mobile-First**: Optimized for phones, works on tablets and desktop
- **RTL Support**: Hebrew (with English translations)
- **Shake to Restart**: Device motion detection
- **Haptic Feedback**: Vibration API integration

## 🛠️ Tech Stack

- **Framework**: Svelte 4+
- **Build Tool**: Vite
- **Language**: TypeScript
- **PWA**: vite-plugin-pwa with Workbox
- **Routing**: svelte-routing
- **State Management**: Svelte stores
- **Testing**: Vitest

## 📱 PWA Features

The app is configured as a Progressive Web App with:
- Service Worker for offline functionality
- Web App Manifest for installation
- Responsive design for all devices
- Safe area support for iOS notches

## 🌐 Browser Support

- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT
