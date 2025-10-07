<script lang="ts">
  import { vibratePattern } from '$utils/vibration';
  import { settingsStore } from '$stores/index';
  import { getPrintedNumber } from '$game-engine/index';

  interface Props {
    /** The number value to display */
    value: number;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Whether the button is selected */
    selected?: boolean;
    /** Click handler */
    onclick?: () => void;
  }

  let {
    value,
    disabled = false,
    selected = false,
    onclick,
  }: Props = $props();

  /** Format the number for display */
  const displayValue = $derived(getPrintedNumber(value));

  /** Handle button click */
  function handleClick() {
    if (disabled) return;
    
    // Vibrate on button press
    vibratePattern('button', $settingsStore.vibrationEnabled);
    
    onclick?.();
  }
</script>

<button
  class="number-button"
  class:selected
  {disabled}
  onclick={handleClick}
  type="button"
>
  <span class="number-value">{displayValue}</span>
</button>

<style>
  .number-button {
    /* Circular button */
    width: var(--button-size, 80px);
    height: var(--button-size, 80px);
    border-radius: 50%;
    
    /* Reset default button styles */
    border: none;
    padding: 0;
    margin: 0;
    
    /* Styling */
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: var(--color-text-light);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xl);
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

  .number-button:hover:not(:disabled):not(.selected) {
    transform: translateY(-2px);
    box-shadow: 
      0 6px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  .number-button:active:not(:disabled):not(.selected) {
    transform: translateY(0);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .number-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    background: linear-gradient(135deg, #999 0%, #777 100%);
  }

  .number-button.selected {
    background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-dark) 100%);
    box-shadow: 
      0 0 0 3px rgba(255, 215, 0, 0.5),
      0 4px 8px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  /* Keep yellow border even when hovering over selected button */
  .number-button.selected:hover:not(:disabled) {
    box-shadow: 
      0 0 0 3px rgba(255, 215, 0, 0.5),
      0 6px 12px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    transform: scale(1.05) translateY(-2px);
  }

  .number-button.selected:active:not(:disabled) {
    box-shadow: 
      0 0 0 3px rgba(255, 215, 0, 0.5),
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    transform: scale(1.05);
  }

  .number-value {
    display: block;
    line-height: 1;
  }

  /* Responsive sizing */
  @media (max-width: 768px) {
    .number-button {
      --button-size: 70px;
      font-size: var(--font-size-lg);
    }
  }

  @media (max-width: 480px) {
    .number-button {
      --button-size: 60px;
      font-size: var(--font-size-md);
    }
  }
</style>
