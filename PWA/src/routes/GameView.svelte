<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { 
    gameStore,
    targetNumber,
    currentNumbers,
    isSolved,
    canUndo,
    currentLevel,
    plays,
    settingsStore,
  } from '$stores/index';
  import {
    NumberButton,
    OperationButton,
    ActionButton,
    TargetDisplay,
    LevelSelector,
    ResultModal,
    HistoryDisplay,
  } from '$components/index';
  import { ShakeDetector } from '$utils/shake';
  import { vibratePattern } from '$utils/vibration';
  import { t } from '$utils/i18n';
  import { type Operation, GameLevel } from '$game-engine/index';

  // Selection state - track selected number values and their indices
  let selectedIndices = $state<number[]>([]);
  let selectedOperation = $state<Operation | null>(null);

  // Modal state
  let showLevelSelector = $state(false);
  let showResultModal = $state(false);
  let isCorrect = $state(false);
  let resultValue = $state<number | undefined>(undefined);

  // Shake detector
  let shakeDetector: ShakeDetector | null = null;

  /** Handle number button click */
  function handleNumberClick(index: number) {
    if (selectedIndices.includes(index)) {
      // Deselect
      selectedIndices = selectedIndices.filter((i) => i !== index);
    } else if (selectedIndices.length < 2) {
      // Select (max 2 numbers)
      selectedIndices = [...selectedIndices, index];
    }
    vibratePattern('tap', $settingsStore.vibrationEnabled);
  }

  /** Handle operation button click */
  function handleOperationClick(op: Operation) {
    if (selectedOperation === op) {
      // Deselect
      selectedOperation = null;
    } else {
      // Select
      selectedOperation = op;
    }
    vibratePattern('tap', $settingsStore.vibrationEnabled);
  }

  /** Execute the selected play */
  function executePlay() {
    if (selectedIndices.length === 2 && selectedOperation !== null) {
      const [idx1, idx2] = selectedIndices;
      const op = selectedOperation;

      // Clear selection FIRST, before the state update
      selectedIndices = [];
      selectedOperation = null;

      // Execute the play with INDICES (not values!)
      gameStore.addPlay(idx1, idx2, op);
      
      // Use setTimeout to check if solved after state has fully updated
      setTimeout(() => {
        if ($isSolved) {
          isCorrect = true;
          resultValue = $currentNumbers[0];
          showResultModal = true;
        }
      }, 0);
    }
  }

  /** Check if play can be executed */
  $effect(() => {
    // Auto-execute when 2 numbers and 1 operation are selected
    if (selectedIndices.length === 2 && selectedOperation !== null) {
      // Use queueMicrotask to ensure we don't execute during render
      queueMicrotask(() => executePlay());
    }
  });

  /** Handle undo */
  function handleUndo() {
    gameStore.undo();
    selectedIndices = [];
    selectedOperation = null;
    vibratePattern('button', $settingsStore.vibrationEnabled);
  }

  /** Handle new game */
  function handleNewGame() {
    gameStore.newGame($settingsStore.level);
    selectedIndices = [];
    selectedOperation = null;
    showResultModal = false;
    vibratePattern('button', $settingsStore.vibrationEnabled);
  }

  /** Handle level change */
  function handleLevelChange(level: GameLevel) {
    settingsStore.setLevel(level);
    gameStore.newGame(level);
    selectedIndices = [];
    selectedOperation = null;
    showLevelSelector = false;
    vibratePattern('success', $settingsStore.vibrationEnabled);
  }

  /** Handle shake event */
  function handleShake() {
    handleNewGame();
  }

  /** Calculate elliptical position for number buttons */
  function getCircularPosition(index: number, total: number): { x: number; y: number } {
    // Center of the ellipse
    const centerX = 50;
    const centerY = 50;
    
    // Radii as percentage - wider horizontally (radiusX) than vertically (radiusY)
    const radiusX = 40; // Horizontal radius
    const radiusY = 30; // Vertical radius (smaller for ellipse)
    
    // Start angle from top and go clockwise
    const startAngle = -Math.PI / 2; // -90 degrees (top)
    const angleStep = (2 * Math.PI) / total;
    const angle = startAngle + index * angleStep;
    
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    return { x, y };
  }

  // Lifecycle
  onMount(() => {
    // Initialize shake detector
    shakeDetector = new ShakeDetector();
    shakeDetector.addListener(handleShake);
    shakeDetector.start();
  });

  onDestroy(() => {
    // Clean up shake detector
    if (shakeDetector) {
      shakeDetector.stop();
      shakeDetector = null;
    }
  });
</script>

<div class="game-view">
  <!-- Target Display -->
  <TargetDisplay />

  <!-- Numbers Circle -->
  <div class="numbers-container">
    {#each $currentNumbers as number, index (index)}
      {@const pos = getCircularPosition(index, $currentNumbers.length)}
      <div
        class="number-position"
        style="left: {pos.x}%; top: {pos.y}%;"
      >
        <NumberButton
          value={number}
          selected={selectedIndices.includes(index)}
          onclick={() => handleNumberClick(index)}
        />
      </div>
    {/each}
  </div>

  <!-- Operations -->
  <div class="operations-container">
    <OperationButton
      operation="+"
      selected={selectedOperation === '+'}
      onclick={() => handleOperationClick('+')}
    />
    <OperationButton
      operation="-"
      selected={selectedOperation === '-'}
      onclick={() => handleOperationClick('-')}
    />
    <OperationButton
      operation="*"
      selected={selectedOperation === '*'}
      onclick={() => handleOperationClick('*')}
    />
    <OperationButton
      operation="/"
      selected={selectedOperation === '/'}
      onclick={() => handleOperationClick('/')}
    />
  </div>

  <!-- History Display (flexible scrollable area) -->
  <div class="history-wrapper">
    {#if $plays.length > 0}
      <HistoryDisplay plays={$plays} />
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="actions-container">
    <ActionButton
      label={t('newgame')}
      variant="primary"
      onclick={handleNewGame}
    />
    <ActionButton
      label={t('undo')}
      variant="secondary"
      onclick={handleUndo}
      disabled={!$canUndo}
    />
    <ActionButton
      label={t('choose')}
      variant="secondary"
      onclick={() => { showLevelSelector = true; }}
    />
  </div>

  <!-- Modals -->
  <LevelSelector
    bind:show={showLevelSelector}
    currentLevel={$currentLevel}
    onselect={handleLevelChange}
    oncancel={() => { showLevelSelector = false; }}
  />

  <ResultModal
    bind:show={showResultModal}
    correct={isCorrect}
    target={$targetNumber}
    result={resultValue}
    onnewgame={handleNewGame}
    ontryagain={() => { showResultModal = false; }}
  />
</div>

<style>
  .game-view {
    /* Full viewport with exact height */
    height: 100vh;
    height: 100dvh;
    box-sizing: border-box; /* Include padding in height calculation */
    
    /* Layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start; /* Align to top, no extra space */
    gap: clamp(0.5rem, 1.5vh, 0.75rem); /* Smaller responsive gap */
    padding: clamp(0.5rem, 1.5vh, 0.75rem);
    padding-top: max(clamp(0.5rem, 1.5vh, 0.75rem), env(safe-area-inset-top));
    padding-bottom: max(clamp(1rem, 2vh, 1.5rem), env(safe-area-inset-bottom));
    
    /* Background */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    /* Prevent text selection */
    user-select: none;
    -webkit-user-select: none;
    
    /* Prevent overflow - everything must fit */
    overflow: hidden;
  }

  .numbers-container {
    /* Container for elliptical layout - wider than tall */
    position: relative;
    width: min(80vw, 400px);
    height: min(35vh, 180px); /* Use vh for better mobile scaling */
    margin: 0;
    flex-shrink: 0;
  }

  .number-position {
    /* Absolute positioning for circular layout */
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .operations-container {
    /* Horizontal row of operation buttons */
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    flex-wrap: wrap;
    max-width: 400px;
    flex-shrink: 0;
  }

  .history-wrapper {
    /* Flexible container - size to content only */
    width: 100%;
    max-width: 400px;
    min-height: 0;
    flex: 0 0 auto; /* Don't grow or shrink, just fit content */
    
    /* Add small top margin for spacing */
    margin-top: clamp(0.5rem, 2vh, 1rem);
    
    /* Let content flow naturally */
    overflow: visible;
  }

  .actions-container {
    /* Action buttons at bottom */
    display: flex;
    gap: clamp(0.25rem, 1vh, 0.75rem);
    justify-content: center;
    flex-wrap: wrap;
    max-width: 600px;
    width: 100%;
    flex-shrink: 0;
    
    /* Push to bottom with minimal margin */
    margin-top: auto;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .game-view {
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
      padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
    }

    .numbers-container {
      width: min(85vw, 350px);
      height: min(30vh, 160px);
    }

    .operations-container {
      gap: var(--spacing-xs);
    }

    .actions-container {
      gap: var(--spacing-xs);
    }
  }

  @media (max-height: 700px) {
    .game-view {
      gap: var(--spacing-xs);
      padding: var(--spacing-xs);
      padding-bottom: max(var(--spacing-md), env(safe-area-inset-bottom));
    }

    .numbers-container {
      height: min(25vh, 150px);
    }
  }
  
  @media (max-height: 600px) {
    .numbers-container {
      height: min(22vh, 130px);
    }
  }
</style>
