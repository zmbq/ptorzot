<script lang="ts">
  import { vibratePattern } from '$utils/vibration';
  import { settingsStore } from '$stores/index';
  import { getOpString, type Operation } from '$game-engine/index';

  interface Props {
    /** The operation (+, -, *, /) */
    operation: Operation;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Whether the button is selected */
    selected?: boolean;
    /** Click handler */
    onclick?: () => void;
  }

  let {
    operation,
    disabled = false,
    selected = false,
    onclick,
  }: Props = $props();

  /** Get the display symbol for the operation */
  const displaySymbol = $derived(getOpString(operation));

  /** Handle button click */
  function handleClick() {
    if (disabled) return;
    
    // Vibrate on button press
    vibratePattern('button', $settingsStore.vibrationEnabled);
    
    onclick?.();
  }
</script>

<button
  class="operation-button"
  class:selected
  {disabled}
  onclick={handleClick}
  type="button"
  aria-label={operation}
>
  <span class="operation-symbol">{displaySymbol}</span>
</button>

<style>
  .operation-button {
    /* Rectangular button */
    width: var(--op-button-width, 60px);
    height: var(--op-button-height, 60px);
    border-radius: var(--border-radius-md);
    
    /* Reset default button styles */
    border: none;
    padding: 0;
    margin: 0;
    
    /* Styling */
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
    color: var(--color-text-light);
    box-shadow: 
      0 3px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xxl);
    font-weight: 700;
    
    /* Interaction */
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    
    /* Transitions */
    transition: all 0.2s ease;
    
    /* Layout */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .operation-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 5px 10px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .operation-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .operation-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: linear-gradient(135deg, #999 0%, #777 100%);
  }

  .operation-button.selected {
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
    box-shadow: 
      0 0 0 3px rgba(255, 215, 0, 0.5),
      0 3px 6px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  .operation-symbol {
    display: block;
    line-height: 1;
  }

  /* Responsive sizing */
  @media (max-width: 768px) {
    .operation-button {
      --op-button-width: 55px;
      --op-button-height: 55px;
      font-size: var(--font-size-xl);
    }
  }

  @media (max-width: 480px) {
    .operation-button {
      --op-button-width: 50px;
      --op-button-height: 50px;
      font-size: var(--font-size-lg);
    }
  }
</style>
