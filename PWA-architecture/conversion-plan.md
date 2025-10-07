# PtorZot Android to Svelte PWA - Conversion Plan

## Overview

This document outlines the step-by-step conversion plan for transforming the PtorZot Android game into a fully functional Svelte PWA. The plan is designed to build incrementally, with frequent testing checkpoints to ensure each component works before moving to the next.

## Current Status ✅

- ✅ Svelte + Vite + TypeScript toolchain set up
- ✅ PWA infrastructure configured (service worker, manifest)
- ✅ Project structure created
- ✅ Custom Svelte 5-compatible router implemented
- ✅ Global CSS with variables and utilities
- ✅ Dev server running successfully
- ✅ Basic "coming soon" placeholder page working

## Conversion Strategy

### Guiding Principles

1. **Bottom-Up Approach**: Build foundational logic first, then UI
2. **Framework Agnostic Core**: Keep game logic pure TypeScript (no Svelte dependencies)
3. **Incremental Testing**: Test each component as it's built
4. **Mobile-First**: Optimize for phone screens, then enhance for larger devices
5. **Preserve Game Logic**: Port the exact game mechanics from Android

---

## Phase 1: Core Game Engine (Pure TypeScript)

**Goal**: Implement all game logic without any UI dependencies

### Step 1.1: Data Models & Utilities
**Files to Create**:
- `src/game-engine/formatters.ts`
  - Port `Formattings.java`
  - `getOpString()` - Operation symbol formatting (+, -, ×, ÷)
  - `getPrintedNumber()` - Format numbers (integer vs decimal)
  - `applyOperation()` - Perform arithmetic calculations

**Android Source**: `Android/src/com/platonix/ptorzot/Formattings.java`

**Test**: Create simple unit tests or manual console tests
```typescript
console.log(getPrintedNumber(5)); // "5"
console.log(getPrintedNumber(3.5)); // "3.50"
console.log(applyOperation(5, 3, '+')); // 8
```

**Pause Point**: ✋ Verify formatters work correctly

---

### Step 1.2: OnePlay Class
**Files to Create**:
- `src/game-engine/OnePlay.ts`
  - Port `GameState.OnePlay` inner class
  - Store first/second indices, operation, pre/post number arrays
  - Calculate result automatically
  - JSON serialization for localStorage

**Android Source**: `Android/src/com/platonix/ptorzot/GameState.java` (OnePlay inner class)

**Properties**:
- `first: number` - Index of first number
- `second: number` - Index of second number  
- `operation: string` - The operation (+, -, *, /)
- `numbersPre: number[]` - Array before operation
- `numbersPost: number[]` - Array after operation (calculated)
- `result: number` - Result of operation

**Test**: Create sample plays
```typescript
const play = new OnePlay(0, 1, '+', [3, 5, 7, 2, 9]);
console.log(play.result); // 8
console.log(play.numbersPost); // [8, 7, 2, 9]
```

**Pause Point**: ✋ Verify OnePlay calculations work

---

### Step 1.3: GameState Class
**Files to Create**:
- `src/game-engine/GameState.ts`
  - Port `GameState.java`
  - Store level, numbers array, target, plays array
  - JSON serialization/deserialization
  - Validation logic

**Android Source**: `Android/src/com/platonix/ptorzot/GameState.java`

**Properties**:
- `level: GameLevel` - Current difficulty level
- `numbers: number[]` - The 5 initial numbers (1-9)
- `target: number` - Goal number to reach
- `plays: OnePlay[]` - History of plays made

**Methods**:
- `toJSON()` - Serialize for storage
- `fromJSON()` - Deserialize from storage
- Helper methods for state queries

**Test**: Create and serialize a game state
```typescript
const game = new GameState(level, [3, 5, 7, 2, 9], 42);
const json = game.toJSON();
const restored = GameState.fromJSON(json);
```

**Pause Point**: ✋ Verify GameState serialization works

---

### Step 1.4: Level System
**Files to Create**:
- `src/game-engine/levels/GameLevel.ts` - Abstract base class
- `src/game-engine/levels/EasyLevel.ts` - Easy difficulty
- `src/game-engine/levels/MediumLevel.ts` - Medium difficulty  
- `src/game-engine/levels/HardLevel.ts` - Hard difficulty

**Android Source**: 
- `Android/src/com/platonix/ptorzot/level/GameLevel.java`
- `Android/src/com/platonix/ptorzot/level/EasyLevel.java`
- `Android/src/com/platonix/ptorzot/level/MediumLevel.java`
- `Android/src/com/platonix/ptorzot/level/HardLevel.java`

**GameLevel.ts** (Abstract):
- `getValue()` - Numeric level identifier (0, 1, 2)
- `getName()` - Level name key for i18n
- `getIcon()` - Icon identifier (green, yellow, red)
- `createNewGame()` - Generate solvable puzzle
- `getNextLabels()` - Abstract: Update button labels after play
- `generateNumbers()` - Create 5 random numbers (1-9)
- `findSolvableTarget()` - Algorithm to find valid target
- Static instances: `Easy`, `Medium`, `Hard`
- `fromValue(n)` - Factory method

**Level Configurations**:
- **Easy**: Target 11-40, show only results
- **Medium**: Target 19-60, show expressions with parentheses
- **Hard**: Target 60-120, show expressions with parentheses

**Test**: Generate games at each level
```typescript
const easyGame = GameLevel.Easy.createNewGame();
console.log(easyGame.numbers); // [3, 5, 7, 2, 9]
console.log(easyGame.target); // 23 (within 11-40)

const mediumGame = GameLevel.Medium.createNewGame();
// Verify target is 19-60

const hardGame = GameLevel.Hard.createNewGame();
// Verify target is 60-120
```

**Pause Point**: ✋ Generate 10 games per level, verify all targets are in range and solvable

---

### Step 1.5: Game Engine Index & Types
**Files to Create**:
- `src/game-engine/index.ts` - Export all engine components
- `src/game-engine/types.ts` - Shared TypeScript interfaces

**types.ts**:
```typescript
export type Operation = '+' | '-' | '*' | '/';
export type EntryState = 'empty' | 'firstNumber' | 'operation' | 'secondNumber';

export interface LevelConfig {
  value: number;
  nameKey: string;
  icon: string;
  color: string;
  minTarget: number;
  maxTarget: number;
}
```

**Test**: Import all components from index
```typescript
import { GameState, OnePlay, GameLevel, formatters } from '$game-engine';
```

**Pause Point**: ✋ Verify all game engine exports work

---

## Phase 2: State Management (Svelte Stores)

**Goal**: Create reactive state management with persistence

### Step 2.1: Settings Store
**Files to Create**:
- `src/stores/settingsStore.ts`
  - Port `Settings.java` functionality
  - Default level preference
  - Language preference (Hebrew/English)
  - Auto-persist to localStorage

**Android Source**: `Android/src/com/platonix/ptorzot/Settings.java`

**Store Structure**:
```typescript
interface SettingsState {
  defaultLevel: GameLevel;
  language: 'he' | 'en';
  soundEnabled: boolean; // For future
  vibrationEnabled: boolean;
}
```

**Methods**:
- `setDefaultLevel(level)`
- `setLanguage(lang)`
- `toggleVibration()`
- Auto-persist on changes

**Test**: 
```typescript
import { settingsStore } from '$stores/settingsStore';
settingsStore.setDefaultLevel(GameLevel.Hard);
// Reload page, verify setting persists
```

**Pause Point**: ✋ Verify settings persist across page reloads

---

### Step 2.2: Game Store
**Files to Create**:
- `src/stores/gameStore.ts`
  - Current game state
  - Entry state machine (empty → firstNumber → operation → secondNumber)
  - Play history
  - Auto-persist game state

**Android Source**: `Android/src/com/platonix/ptorzot/GameActivity.java` (state management parts)

**Store Structure**:
```typescript
interface GameStoreState {
  currentGame: GameState | null;
  entryState: EntryState;
  firstNumber: number | null;
  secondNumber: number | null;
  operation: Operation | null;
  labels: string[]; // Current button labels
}
```

**Actions**:
- `startNewGame(level)` - Create new puzzle
- `selectNumber(index)` - Handle number button click
- `selectOperation(op)` - Handle operation button click
- `executePlay()` - Create OnePlay and update game
- `undoPlay()` - Remove last play
- `resetEntry()` - Clear entry state
- `updateLabels()` - Recalculate button labels based on level

**Derived Stores**:
- `activeNumbersCount` - How many buttons to show (5 - plays.length)
- `scratchPadText` - Current expression being built
- `isGameComplete` - Only 1 number left

**Test**: 
```typescript
gameStore.startNewGame(GameLevel.Easy);
gameStore.selectNumber(0);
gameStore.selectOperation('+');
gameStore.selectNumber(1);
// Verify play was executed and labels updated
```

**Pause Point**: ✋ Test complete game flow in console

---

### Step 2.3: Stores Index
**Files to Create**:
- `src/stores/index.ts` - Export all stores

**Pause Point**: ✋ Verify stores can be imported cleanly

---

## Phase 3: Utilities & Platform APIs

**Goal**: Create reusable utilities for device features

### Step 3.1: Storage Utilities
**Files to Create**:
- `src/utils/storage.ts`
  - `saveToStorage<T>(key, value)`
  - `loadFromStorage<T>(key)`
  - `removeFromStorage(key)`
  - Error handling for quota exceeded

**Test**: 
```typescript
saveToStorage('test', { foo: 'bar' });
const loaded = loadFromStorage('test');
console.log(loaded); // { foo: 'bar' }
```

**Pause Point**: ✋ Verify storage works

---

### Step 3.2: Vibration Utility
**Files to Create**:
- `src/utils/vibration.ts`
  - `vibrate(duration)` - Single vibration
  - `vibratePattern(pattern)` - Pattern vibration
  - Feature detection
  - Respect settings store

**Android Source**: `Android/src/com/platonix/ptorzot/GameActivity.java` (Vibrator usage)

**Test**: 
```typescript
vibrate(50); // Quick tap feedback
vibratePattern([100, 50, 100]); // Pattern
```

**Pause Point**: ✋ Test on mobile device

---

### Step 3.3: Shake Detection Action
**Files to Create**:
- `src/actions/shake.ts`
  - Svelte action for shake detection
  - Uses DeviceMotionEvent API
  - Port algorithm from `ShakeEventListener.java`

**Android Source**: `Android/src/com/platonix/ptorzot/ShakeEventListener.java`

**Algorithm Parameters**:
- MIN_FORCE: 10
- MIN_DIRECTION_CHANGE: 3
- MAX_PAUSE_BETWEEN_DIRECTION_CHANGE: 200ms
- MAX_TOTAL_DURATION_OF_SHAKE: 400ms

**Usage**:
```svelte
<div use:shake={handleShake}>
  <!-- Game content -->
</div>
```

**Test**: Test on mobile device by shaking

**Pause Point**: ✋ Verify shake detection works on mobile

---

### Step 3.4: Internationalization
**Files to Create**:
- `src/utils/i18n.ts`
  - Translation function
  - Hebrew and English strings
  - RTL detection

**Android Source**: `Android/res/values/strings.xml`

**Translations to Port**:
- App name, level names
- Operation symbols
- UI labels (mission, numbers, correct, wrong, etc.)
- Menu items

**Test**: 
```typescript
t('app.name'); // "פתור זאת"
t('level.easy'); // "קל"
```

**Pause Point**: ✋ Verify all strings are translated

---

### Step 3.5: Constants
**Files to Create**:
- `src/utils/constants.ts`
  - Colors for levels
  - Animation durations
  - Layout constants (button size, spacing, etc.)

**Pause Point**: ✋ Quick review

---

## Phase 4: UI Components (Bottom to Top)

**Goal**: Build reusable Svelte components

### Step 4.1: NumberButton Component
**Files to Create**:
- `src/components/NumberButton.svelte`

**Android Source**: `Android/res/layout/activity_game.xml` (button definitions)

**Props**:
- `value: string` - Number or expression to display
- `index: number` - Button index
- `disabled: boolean` - Whether button is clickable
- `position?: { x: number, y: number }` - Absolute position for circular layout

**Events**:
- `click` - Emits index when clicked

**Styling**:
- Circular button (border-radius: 50%)
- Minimum 60px width/height
- 18pt font size
- Gradient background
- Active state (scale down)
- Disabled state (opacity 0.5)

**Test**: Create standalone test page with 5 buttons

**Pause Point**: ✋ Verify button looks good and responds to clicks

---

### Step 4.2: OperationButton Component
**Files to Create**:
- `src/components/OperationButton.svelte`

**Android Source**: `Android/res/layout/activity_game.xml` (operation buttons)

**Props**:
- `operation: Operation` - +, -, *, /
- `disabled?: boolean`

**Events**:
- `click` - Emits operation

**Styling**:
- Rectangular button
- Equal width (flex: 1)
- 14pt font size
- Use Unicode symbols (×, ÷)

**Test**: Create row of 4 operation buttons

**Pause Point**: ✋ Verify buttons display correctly

---

### Step 4.3: TargetDisplay Component
**Files to Create**:
- `src/components/TargetDisplay.svelte`

**Props**:
- `value: number` - Target number

**Styling**:
- Centered in circular layout
- Large font (14pt from Android)
- Bordered or background

**Test**: Display with sample target

**Pause Point**: ✋ Verify display looks good

---

### Step 4.4: ScratchPad Component
**Files to Create**:
- `src/components/ScratchPad.svelte`

**Android Source**: `GameActivity.java` - `setScratchPadText()` method

**Props**:
- `text: string` - Current expression

**Styling**:
- Bordered rectangle
- Left-aligned text (RTL aware)
- 14pt font
- Padding for readability

**Test**: Display various expressions
- Empty
- "5"
- "5 +"
- "5 + 3"
- "(5 + 3) × 2"

**Pause Point**: ✋ Verify text displays correctly with RTL

---

### Step 4.5: LevelIndicator Component
**Files to Create**:
- `src/components/LevelIndicator.svelte`

**Android Source**: `GameActivity.java` - level display

**Props**:
- `level: GameLevel`

**Features**:
- Shows level icon (green/yellow/red circle)
- Shows level text below
- Clickable to change level

**Events**:
- `click` - Open level selection

**Test**: Display for each level

**Pause Point**: ✋ Verify indicator displays correctly

---

### Step 4.6: CircularLayout Component
**Files to Create**:
- `src/components/CircularLayout.svelte`

**Android Source**: `GameActivity.java` - `layoutNumberButtons()` and `delayedLayoutNumberButtons()`

**Algorithm**:
```typescript
// Position buttons in circle around center
const radius = Math.min(width, height) * 0.4;
const angleIncrement = (Math.PI * 2) / numButtons;
const startAngle = -Math.PI;

for (let i = 0; i < numButtons; i++) {
  const angle = startAngle + (angleIncrement * i);
  const x = centerX + radius * Math.sin(angle);
  const y = centerY + radius * Math.cos(angle);
  // Position button at (x, y)
}
```

**Props**:
- `count: number` - Number of active buttons
- Slots for buttons and target

**Features**:
- Reactive to window resize
- Centers target in middle
- Positions number buttons in circle

**Test**: Test with 5, 4, 3, 2, 1 buttons

**Pause Point**: ✋ Verify circular layout works at different counts

---

### Step 4.7: LevelSelectionDialog Component
**Files to Create**:
- `src/components/LevelSelectionDialog.svelte`

**Android Source**: `GameActivity.java` - `onLevelClick()` AlertDialog

**Props**:
- `open: boolean`
- `currentLevel: GameLevel`

**Events**:
- `select` - Emits selected level
- `close` - Dialog closed

**Features**:
- Radio buttons for Easy/Medium/Hard
- Descriptions for each level
- Confirm/Cancel buttons

**Test**: Open dialog, select different levels

**Pause Point**: ✋ Verify dialog works

---

### Step 4.8: ConfirmDialog Component
**Files to Create**:
- `src/components/ConfirmDialog.svelte`

**Android Source**: `GameActivity.java` - `askIfExit()` AlertDialog

**Props**:
- `open: boolean`
- `title: string`
- `message: string`

**Events**:
- `confirm` - User confirmed
- `cancel` - User cancelled

**Test**: Show exit confirmation

**Pause Point**: ✋ Verify dialog works

---

## Phase 5: Main Game View

**Goal**: Assemble all components into the working game screen

### Step 5.1: GameView Implementation
**Files to Update**:
- `src/routes/GameView.svelte`

**Android Source**: `Android/src/com/platonix/ptorzot/GameActivity.java`

**Structure**:
```svelte
<script lang="ts">
  import { gameStore, settingsStore } from '$stores';
  import { shake } from '$actions/shake';
  import NumberButton from '$components/NumberButton.svelte';
  import OperationButton from '$components/OperationButton.svelte';
  import ScratchPad from '$components/ScratchPad.svelte';
  import TargetDisplay from '$components/TargetDisplay.svelte';
  import CircularLayout from '$components/CircularLayout.svelte';
  import LevelIndicator from '$components/LevelIndicator.svelte';
  
  // State from stores
  let game = $derived($gameStore.currentGame);
  let activeCount = $derived($gameStore.activeNumbersCount);
  let scratchText = $derived($gameStore.scratchPadText);
  
  // Event handlers
  function handleNumberClick(index: number) { ... }
  function handleOperationClick(op: Operation) { ... }
  function handleShake() { ... }
  function handleLevelClick() { ... }
</script>

<div class="game-view" use:shake={handleShake}>
  <img src="/assets/images/title.png" alt="PtorZot" class="title" />
  
  <div class="header">
    <ScratchPad text={scratchText} />
    <LevelIndicator level={game?.level} on:click={handleLevelClick} />
  </div>
  
  <CircularLayout count={activeCount}>
    {#each game?.numbers.slice(0, activeCount) as number, i}
      <NumberButton
        value={$gameStore.labels[i]}
        {i}
        disabled={/* logic */}
        on:click={(e) => handleNumberClick(e.detail)}
      />
    {/each}
    
    <TargetDisplay value={game?.target} />
  </CircularLayout>
  
  <div class="operations">
    {#each ['+', '-', '*', '/'] as op}
      <OperationButton {op} on:click={(e) => handleOperationClick(e.detail)} />
    {/each}
  </div>
</div>
```

**Entry State Logic**:
- Empty → FirstNumber (select first number)
- FirstNumber → Operation (select operation, disable first number)
- Operation → SecondNumber (select second number)
- SecondNumber → Execute play, reset to Empty

**Test Checklist**:
- [ ] Game starts with 5 random numbers and target
- [ ] Can select first number (button disables)
- [ ] Can select operation
- [ ] Can select second number
- [ ] Play executes, numbers reduce to 4
- [ ] Labels update correctly based on level
- [ ] Scratch pad shows current expression
- [ ] Can complete full game (5 plays)
- [ ] Vibration works on number/operation clicks
- [ ] Invalid actions trigger error vibration

**Pause Point**: ✋ **MAJOR MILESTONE** - Play complete game manually

---

### Step 5.2: Back Button / Undo Functionality
**Add to GameView**:
- Browser back button handling
- Undo last play
- Exit confirmation after multiple backs on empty state

**Android Source**: `GameActivity.java` - `onBackPressed()`

**Logic**:
```
- SecondNumber → Operation (clear second)
- Operation → FirstNumber (re-enable first number)
- FirstNumber → Empty
- Empty (with plays) → Undo last play
- Empty (no plays, after 3 backs) → Confirm exit
```

**Test**:
- [ ] Back button works through entry states
- [ ] Can undo plays
- [ ] Exit confirmation appears after 3 backs

**Pause Point**: ✋ Verify undo works correctly

---

### Step 5.3: Menu / Settings Access
**Add to GameView**:
- Menu button (hamburger or three dots)
- Menu options: New Game, Change Level, Exit

**Test**:
- [ ] Can start new game from menu
- [ ] Can change level from menu
- [ ] Can exit from menu

**Pause Point**: ✋ Verify menu works

---

## Phase 6: Result Validation View

**Goal**: Build solution checking screen

### Step 6.1: ResultView Implementation
**Files to Create**:
- `src/routes/ResultView.svelte`

**Android Source**: `Android/src/com/platonix/ptorzot/CheckResultActivity.java`

**Structure**:
```svelte
<script lang="ts">
  import { gameStore } from '$stores';
  import { navigate } from '$utils/router';
  
  // Receive game state from navigation
  let game = $derived($gameStore.currentGame);
  
  // Validate solution
  let isCorrect = $state(false);
  let trace = $state('');
  let result = $state(0);
  
  $effect(() => {
    if (game) {
      ({ isCorrect, trace, result } = validateSolution(game));
    }
  });
  
  function validateSolution(game: GameState) {
    // Port from CheckResultActivity.traceSolution()
    // Replay all plays and check if result matches target
  }
  
  function handleClose() {
    if (isCorrect) {
      gameStore.startNewGame($settingsStore.defaultLevel);
    }
    navigate('/');
  }
</script>

<div class="result-view">
  <img src="/assets/images/title.png" class="title" />
  
  <div class="info">
    <p>{t('game.target')} <strong>{game?.target}</strong></p>
    <p>{t('game.numbers')} {game?.numbers.join(', ')}</p>
  </div>
  
  <div class="trace">
    {trace}
  </div>
  
  {#if isCorrect}
    <img src="/assets/images/success.png" alt={t('result.correct')} />
  {:else}
    <p class="wrong">{t('result.wrong')}</p>
  {/if}
  
  <button on:click={handleClose}>
    {isCorrect ? t('result.newgame') : t('result.tryagain')}
  </button>
</div>
```

**Test Checklist**:
- [ ] Correct solution shows success image
- [ ] Wrong solution shows error message
- [ ] Trace shows all plays
- [ ] "New Game" button starts new game on success
- [ ] "Try Again" button returns to game on failure

**Pause Point**: ✋ Test both correct and incorrect solutions

---

### Step 6.2: Navigation Integration
**Update**:
- GameView navigates to ResultView when game completes (1 number left)
- ResultView navigates back to GameView

**Add route**:
```typescript
const routes = [
  { path: '/', component: GameView },
  { path: '/result', component: ResultView },
];
```

**Test**:
- [ ] Game navigates to result on completion
- [ ] Result navigates back to game

**Pause Point**: ✋ Verify navigation works

---

## Phase 7: Assets & Polish

**Goal**: Import Android assets and add visual polish

### Step 7.1: Import Android Assets
**Copy files from Android to PWA**:
- `Android/res/drawable/old_mathematics.png` → `public/assets/images/background.png`
- `Android/res/drawable/title.png` → `public/assets/images/title.png`
- `Android/res/drawable/nachonmeod.png` → `public/assets/images/success.png`
- `Android/res/drawable/green.png` → `public/assets/images/green.png`
- `Android/res/drawable/yellow.png` → `public/assets/images/yellow.png`
- `Android/res/drawable/red.png` → `public/assets/images/red.png`
- Icons from `Android/res/drawable-*/ic_launcher.png` → Convert to PWA icon set

**Create PWA Icons**:
- Generate 192x192, 512x512 versions
- Create maskable icon variant
- Update manifest in vite.config.ts

**Update CSS**:
- Add background image to game view
- Style to match Android visual design

**Test**:
- [ ] All images load correctly
- [ ] Background displays properly
- [ ] PWA icons show in install prompt

**Pause Point**: ✋ Verify all assets display

---

### Step 7.2: Responsive Design
**Test on devices**:
- iPhone (portrait)
- iPhone (landscape)
- Android phone (portrait)
- Android phone (landscape)
- iPad (portrait)
- iPad (landscape)
- Desktop (1920x1080)

**Fix issues**:
- Adjust button sizes for landscape
- Ensure touch targets are 44px minimum
- Test safe area insets on iPhone with notch
- Verify circular layout works at all sizes

**Test Checklist**:
- [ ] Buttons are tappable on small phones
- [ ] Layout doesn't overflow on any device
- [ ] Text is readable at all sizes
- [ ] Safe areas respected on iPhone

**Pause Point**: ✋ Test on multiple real devices

---

### Step 7.3: Animations & Transitions
**Add subtle animations**:
- Button press animations (scale down)
- Number disappearing animation
- Success/error feedback animations
- Page transitions

**Keep it simple** - Android app has no animations, but subtle feedback improves PWA feel

**Test**:
- [ ] Animations feel smooth (60fps)
- [ ] Don't interfere with gameplay
- [ ] Respect prefers-reduced-motion

**Pause Point**: ✋ Verify animations enhance UX

---

### Step 7.4: Loading States
**Add**:
- Initial app loading spinner
- Game generation loading (if slow)
- Graceful degradation if JS disabled

**Pause Point**: ✋ Test on slow network

---

## Phase 8: PWA Features & Optimization

**Goal**: Make it feel like a native app

### Step 8.1: Service Worker Testing
**Test**:
- [ ] App works offline after first load
- [ ] Assets are cached correctly
- [ ] Updates work properly
- [ ] Add to home screen works (iOS & Android)

**Pause Point**: ✋ Test offline functionality

---

### Step 8.2: Performance Optimization
**Optimize**:
- Lighthouse audit (aim for 90+ on all metrics)
- Bundle size analysis
- Code splitting if needed
- Image optimization (WebP with fallbacks)
- Lazy load non-critical components

**Target Metrics**:
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Total bundle: < 100KB (Svelte should be ~40KB)

**Pause Point**: ✋ Run Lighthouse, fix issues

---

### Step 8.3: Accessibility
**Ensure**:
- Keyboard navigation works
- Screen reader support (ARIA labels)
- Sufficient color contrast
- Focus indicators visible
- Touch targets 44px minimum

**Test with**:
- VoiceOver (iOS)
- TalkBack (Android)
- Keyboard only

**Pause Point**: ✋ Accessibility audit

---

### Step 8.4: Browser Compatibility
**Test on**:
- Chrome (desktop & mobile)
- Safari (desktop & mobile)
- Firefox (desktop & mobile)
- Edge (desktop)

**Fix issues**:
- Polyfills if needed
- Vendor prefixes
- Fallbacks for unsupported features

**Pause Point**: ✋ Cross-browser testing

---

## Phase 9: Testing & Quality Assurance

**Goal**: Ensure game works perfectly

### Step 9.1: Manual Testing
**Test all features**:
- [ ] Complete 10 games at each difficulty level
- [ ] Test all undo scenarios
- [ ] Test shake to restart
- [ ] Test level switching
- [ ] Test persistence (reload page mid-game)
- [ ] Test all error cases
- [ ] Test menu and dialogs
- [ ] Test on slow network
- [ ] Test on fast network

**Pause Point**: ✋ Fix all bugs found

---

### Step 9.2: Automated Tests (Optional but Recommended)
**Write tests**:
- Unit tests for game engine (GameState, OnePlay, levels)
- Component tests for UI components
- E2E tests for critical flows

**Test Coverage**:
- Aim for 80%+ on game engine
- Key component tests
- At least one full game E2E test

**Pause Point**: ✋ Verify tests pass

---

### Step 9.3: User Testing
**Get feedback**:
- Ask friends/family to play
- Observe where they struggle
- Collect feedback on UX

**Iterate**:
- Fix confusing UX
- Improve unclear elements
- Polish rough edges

**Pause Point**: ✋ Incorporate feedback

---

## Phase 10: Deployment

**Goal**: Ship to production

### Step 10.1: Production Build
**Create**:
```bash
pnpm build
```

**Verify**:
- [ ] Build completes without errors
- [ ] Bundle size is acceptable
- [ ] Source maps generated (or excluded for production)
- [ ] Service worker registered
- [ ] Manifest correct

**Test production build**:
```bash
pnpm preview
```

**Pause Point**: ✋ Test production build thoroughly

---

### Step 10.2: Hosting Setup
**Options**:
1. **Netlify** (Recommended)
   - Easy PWA support
   - Automatic HTTPS
   - Free tier generous
   
2. **Vercel**
   - Great DX
   - Edge network
   
3. **GitHub Pages**
   - Free for public repos
   - Simple setup

**Deploy**:
- Set up hosting
- Configure custom domain (optional)
- Set up CI/CD (GitHub Actions)

**Pause Point**: ✋ Verify deployment works

---

### Step 10.3: Final QA on Production
**Test on production URL**:
- [ ] All features work
- [ ] PWA install works
- [ ] Offline works
- [ ] Performance is good
- [ ] No console errors

**Pause Point**: ✋ Final sign-off

---

## Success Criteria

The conversion is complete when:

✅ All game mechanics from Android work identically in PWA
✅ Game is playable on iOS and Android phones
✅ PWA can be installed to home screen
✅ Game works offline
✅ Lighthouse score 90+ on all metrics
✅ No critical bugs
✅ User testing feedback positive
✅ Deployed to production

---

## Rollback Plan

If major issues arise:
1. Each phase is independent - can revert to last working phase
2. Git branches for each major milestone
3. Production deployment only after thorough testing

---

## Time Estimates

- **Phase 1**: Game Engine - 4-6 hours
- **Phase 2**: State Management - 2-3 hours
- **Phase 3**: Utilities - 2-3 hours
- **Phase 4**: UI Components - 6-8 hours
- **Phase 5**: Main Game View - 4-6 hours
- **Phase 6**: Result View - 2-3 hours
- **Phase 7**: Assets & Polish - 3-4 hours
- **Phase 8**: PWA Features - 2-3 hours
- **Phase 9**: Testing & QA - 4-6 hours
- **Phase 10**: Deployment - 1-2 hours

**Total Estimated Time**: 30-44 hours

**Realistic Timeline**: 1-2 weeks part-time, 3-5 days full-time

---

## Next Step

🚀 **Begin Phase 1, Step 1.1: Create formatters.ts**

Ready to start coding! The foundation is solid, and the plan is clear. Let's build this game! 🎮
