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

  // Selection state
  let selectedNumbers = $state<number[]>([]);
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
    if (selectedNumbers.includes(index)) {
      // Deselect
      selectedNumbers = selectedNumbers.filter((i) => i !== index);
    } else if (selectedNumbers.length < 2) {
      // Select (max 2 numbers)
      selectedNumbers = [...selectedNumbers, index];
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
    if (selectedNumbers.length === 2 && selectedOperation !== null) {
      const [idx1, idx2] = selectedNumbers;
      const num1 = $currentNumbers[idx1];
      const num2 = $currentNumbers[idx2];

      gameStore.addPlay(num1, num2, selectedOperation);
      
      // Clear selection
      selectedNumbers = [];
      selectedOperation = null;

      // Check if solved
      if ($isSolved) {
        isCorrect = true;
        resultValue = $currentNumbers[0];
        showResultModal = true;
      }
    }
  }

  /** Check if play can be executed */
  $effect(() => {
    // Auto-execute when 2 numbers and 1 operation are selected
    if (selectedNumbers.length === 2 && selectedOperation !== null) {
      executePlay();
    }
  });

  /** Handle undo */
  function handleUndo() {
    gameStore.undo();
    selectedNumbers = [];
    selectedOperation = null;
    vibratePattern('button', $settingsStore.vibrationEnabled);
  }

  /** Handle new game */
  function handleNewGame() {
    gameStore.newGame($settingsStore.level);
    selectedNumbers = [];
    selectedOperation = null;
    showResultModal = false;
    vibratePattern('button', $settingsStore.vibrationEnabled);
  }

  /** Handle level change */
  function handleLevelChange(level: GameLevel) {
    settingsStore.setLevel(level);
    gameStore.newGame(level);
    selectedNumbers = [];
    selectedOperation = null;
    showLevelSelector = false;
    vibratePattern('success', $settingsStore.vibrationEnabled);
  }

  /** Handle shake event */
  function handleShake() {
    handleNewGame();
  }

  /** Calculate circular position for number buttons */
  function getCircularPosition(index: number, total: number): { x: number; y: number } {
    // Center of the circle
    const centerX = 50;
    const centerY = 50;
    
    // Radius as percentage
    const radius = 35;
    
    // Start angle from top and go clockwise
    const startAngle = -Math.PI / 2; // -90 degrees (top)
    const angleStep = (2 * Math.PI) / total;
    const angle = startAngle + index * angleStep;
    
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    
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
          selected={selectedNumbers.includes(index)}
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

  <!-- History Display -->
  {#if $plays.length > 0}
    <HistoryDisplay plays={$plays} />
  {/if}

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
    /* Full viewport */
    min-height: 100vh;
    min-height: 100dvh;
    
    /* Layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xl);
    padding: var(--spacing-lg);
    padding-top: max(var(--spacing-lg), env(safe-area-inset-top));
    padding-bottom: max(var(--spacing-lg), env(safe-area-inset-bottom));
    
    /* Background */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    /* Prevent text selection */
    user-select: none;
    -webkit-user-select: none;
  }

  .numbers-container {
    /* Container for circular layout */
    position: relative;
    width: min(90vw, 400px);
    height: min(90vw, 400px);
    margin: var(--spacing-xl) 0;
  }

  .number-position {
    /* Absolute positioning for circular layout */
    position: absolute;
    transform: translate(-50%, -50%);
  }

  .operations-container {
    /* Horizontal row of operation buttons */
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
    max-width: 400px;
  }

  .actions-container {
    /* Action buttons at bottom */
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    flex-wrap: wrap;
    max-width: 600px;
    width: 100%;
    margin-top: auto;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .game-view {
      gap: var(--spacing-md);
      padding: var(--spacing-md);
    }

    .numbers-container {
      width: min(85vw, 350px);
      height: min(85vw, 350px);
    }

    .operations-container {
      gap: var(--spacing-sm);
    }

    .actions-container {
      gap: var(--spacing-sm);
    }
  }

  @media (max-height: 700px) {
    .game-view {
      gap: var(--spacing-md);
    }

    .numbers-container {
      margin: var(--spacing-md) 0;
    }
  }
</style>
