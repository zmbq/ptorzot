# Development Guide

## Quick Start

```bash
# Start development server
pnpm dev

# In another terminal, run type checking in watch mode
pnpm run check --watch
```

## Development Workflow

### 1. Creating a New Component

```bash
# Create component file
touch src/components/MyComponent.svelte
```

Component template:
```svelte
<script lang="ts">
  // Props
  export let myProp: string;
  
  // Local state
  let count = 0;
  
  // Functions
  function handleClick() {
    count++;
  }
</script>

<div class="my-component">
  <p>{myProp}</p>
  <button on:click={handleClick}>
    Count: {count}
  </button>
</div>

<style>
  .my-component {
    padding: var(--spacing-md);
  }
</style>
```

### 2. Creating a Store

```typescript
// src/stores/myStore.ts
import { writable } from 'svelte/store';

export const myStore = writable<string>('initial value');

// With custom methods
function createMyStore() {
  const { subscribe, set, update } = writable<number>(0);
  
  return {
    subscribe,
    increment: () => update(n => n + 1),
    decrement: () => update(n => n - 1),
    reset: () => set(0)
  };
}

export const counter = createMyStore();
```

Using in component:
```svelte
<script lang="ts">
  import { counter } from '$stores/myStore';
</script>

<p>Count: {$counter}</p>
<button on:click={counter.increment}>+</button>
```

### 3. Creating a Svelte Action

```typescript
// src/actions/longpress.ts
export function longpress(node: HTMLElement, duration: number = 500) {
  let timer: number;
  
  function handleMouseDown() {
    timer = window.setTimeout(() => {
      node.dispatchEvent(new CustomEvent('longpress'));
    }, duration);
  }
  
  function handleMouseUp() {
    clearTimeout(timer);
  }
  
  node.addEventListener('mousedown', handleMouseDown);
  node.addEventListener('mouseup', handleMouseUp);
  
  return {
    update(newDuration: number) {
      duration = newDuration;
    },
    destroy() {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('mouseup', handleMouseUp);
    }
  };
}
```

Using in component:
```svelte
<script lang="ts">
  import { longpress } from '$actions/longpress';
  
  function handleLongPress() {
    console.log('Long pressed!');
  }
</script>

<button use:longpress={1000} on:longpress={handleLongPress}>
  Press and hold
</button>
```

### 4. Path Aliases

Use these path aliases for clean imports:

```typescript
import Something from '$lib/Something';           // src/lib/
import Button from '$components/Button.svelte';   // src/components/
import GameState from '$game-engine/GameState';   // src/game-engine/
import { gameStore } from '$stores/gameStore';    // src/stores/
import { vibrate } from '$utils/vibrate';         // src/utils/
```

### 5. TypeScript Best Practices

```typescript
// Define interfaces for complex types
interface Player {
  id: string;
  name: string;
  score: number;
}

// Use type for unions and simple types
type Direction = 'up' | 'down' | 'left' | 'right';

// Generic functions
function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

// Svelte component props with types
export let players: Player[];
export let onSelect: (player: Player) => void;
```

### 6. CSS Custom Properties

Available CSS variables:

```css
/* Colors */
var(--color-bg)          /* Background */
var(--color-text)        /* Text */
var(--color-primary)     /* Primary brand color */
var(--color-easy)        /* Green for easy level */
var(--color-medium)      /* Yellow for medium level */
var(--color-hard)        /* Red for hard level */

/* Spacing */
var(--spacing-xs)        /* 0.25rem */
var(--spacing-sm)        /* 0.5rem */
var(--spacing-md)        /* 1rem */
var(--spacing-lg)        /* 1.5rem */
var(--spacing-xl)        /* 2rem */

/* Border Radius */
var(--radius-sm)         /* 4px */
var(--radius-md)         /* 8px */
var(--radius-lg)         /* 12px */
var(--radius-full)       /* 50% */

/* Shadows */
var(--shadow-sm)
var(--shadow-md)
var(--shadow-lg)

/* Transitions */
var(--transition-fast)   /* 150ms */
var(--transition-base)   /* 250ms */
var(--transition-slow)   /* 350ms */

/* Font Sizes */
var(--font-size-sm)      /* 0.875rem */
var(--font-size-base)    /* 1rem */
var(--font-size-lg)      /* 1.125rem */
var(--font-size-xl)      /* 1.5rem */
var(--font-size-2xl)     /* 2rem */
var(--font-size-3xl)     /* 3rem */
```

### 7. Testing Components

```typescript
// src/components/__tests__/Button.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button.svelte';

describe('Button', () => {
  it('renders with text', () => {
    const { getByText } = render(Button, {
      props: { label: 'Click me' }
    });
    
    expect(getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { getByRole } = render(Button, {
      props: { label: 'Click', onClick: handleClick }
    });
    
    await fireEvent.click(getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Useful Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm dev --host            # Expose to network (for mobile testing)

# Type Checking
pnpm check                 # One-time check
pnpm check --watch         # Watch mode

# Building
pnpm build                 # Production build
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run all tests
pnpm test --watch          # Watch mode
pnpm test:ui               # Open Vitest UI
pnpm test Button           # Run specific test

# Linting (when configured)
pnpm lint                  # Run linter
```

## Debugging

### Browser DevTools

1. **Sources Tab**: Set breakpoints in TypeScript files
2. **Console**: `$gameStore` to inspect store values (if you expose them)
3. **Application**: Check Service Worker, LocalStorage, PWA manifest
4. **Network**: Monitor API calls and asset loading
5. **Lighthouse**: Test PWA compliance and performance

### VS Code Debugging

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Mobile Testing

### Test on Local Network

```bash
pnpm dev --host
```

Access from phone: `http://YOUR_IP:3000`

### iOS Safari Debugging

1. Enable Web Inspector on iPhone (Settings > Safari > Advanced)
2. Connect iPhone to Mac via USB
3. Open Safari on Mac > Develop > [Your iPhone]

### Android Chrome Debugging

1. Enable USB Debugging on Android
2. Connect to computer
3. Open Chrome > chrome://inspect
4. Click "inspect" on your device

## Performance Tips

1. **Use `{#key}` blocks** for forced re-renders
2. **Memoize expensive computations** with reactive statements
3. **Lazy load routes** with dynamic imports
4. **Optimize images**: Use WebP, proper sizing
5. **Code split**: Keep initial bundle small

## Common Issues

### TypeScript Errors in Svelte Files

Run: `pnpm check` to see detailed errors

### HMR Not Working

- Check for syntax errors
- Restart dev server
- Clear browser cache

### Build Fails

- Check for type errors: `pnpm check`
- Check for unused imports
- Verify all dependencies are installed

### PWA Not Updating

- Clear browser cache
- Unregister service worker in DevTools
- Check service worker update strategy

## Code Style Guidelines

### Naming Conventions

- **Components**: PascalCase (`GameView.svelte`, `NumberButton.svelte`)
- **Stores**: camelCase (`gameStore.ts`, `settingsStore.ts`)
- **Utilities**: camelCase (`formatNumber.ts`, `vibrate.ts`)
- **Types/Interfaces**: PascalCase (`GameState`, `OnePlay`)

### File Organization

```
ComponentName/
├── ComponentName.svelte       # Main component
├── ComponentName.test.ts      # Tests
└── types.ts                   # Type definitions (if complex)
```

### Component Structure

```svelte
<script lang="ts">
  // 1. Imports
  import Something from './Something.svelte';
  
  // 2. Props
  export let required: string;
  export let optional: number = 0;
  
  // 3. Stores
  import { gameStore } from '$stores/gameStore';
  
  // 4. Local state
  let localVar = '';
  
  // 5. Reactive statements
  $: computed = required.toUpperCase();
  
  // 6. Functions
  function handleClick() {
    // ...
  }
  
  // 7. Lifecycle
  import { onMount } from 'svelte';
  onMount(() => {
    // ...
  });
</script>

<!-- Template -->
<div class="component-name">
  <!-- Content -->
</div>

<style>
  /* Scoped styles */
  .component-name {
    /* ... */
  }
</style>
```

## Resources

- [Svelte Docs](https://svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PWA Checklist](https://web.dev/pwa-checklist/)

Happy coding! 🚀
