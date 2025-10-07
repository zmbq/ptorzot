<script lang="ts">
  import { vibratePattern } from '$utils/vibration';
  import { settingsStore } from '$stores/index';

  interface Props {
    /** Button text/label */
    label: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Button variant (style) */
    variant?: 'primary' | 'secondary' | 'danger';
    /** Click handler */
    onclick?: () => void;
    /** Optional icon (slot) */
    children?: import('svelte').Snippet;
  }

  let {
    label,
    disabled = false,
    variant = 'primary',
    onclick,
    children,
  }: Props = $props();

  /** Handle button click */
  function handleClick() {
    if (disabled) return;
    
    // Vibrate on button press
    vibratePattern('button', $settingsStore.vibrationEnabled);
    
    onclick?.();
  }
</script>

<button
  class="action-button"
  class:primary={variant === 'primary'}
  class:secondary={variant === 'secondary'}
  class:danger={variant === 'danger'}
  {disabled}
  onclick={handleClick}
  type="button"
>
  {#if children}
    <span class="icon">
      {@render children()}
    </span>
  {/if}
  <span class="label">{label}</span>
</button>

<style>
  .action-button {
    /* Sizing */
    min-width: 100px;
    height: 40px;
    padding: 0 var(--spacing-md);
    
    /* Reset default button styles */
    border: none;
    margin: 0;
    
    /* Styling */
    border-radius: var(--border-radius-md);
    box-shadow: 
      0 2px 4px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--color-text-light);
    
    /* Interaction */
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    
    /* Transitions */
    transition: all 0.2s ease;
    
    /* Layout */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
  }

  /* Primary variant (default) */
  .action-button.primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  }

  .action-button.primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* Secondary variant */
  .action-button.secondary {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
  }

  .action-button.secondary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* Danger variant */
  .action-button.danger {
    background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
  }

  .action-button.danger:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 
      0 4px 8px rgba(211, 47, 47, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }

  /* Common hover/active states */
  .action-button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 
      0 1px 2px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .action-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background: linear-gradient(135deg, #999 0%, #777 100%);
  }

  .icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-lg);
  }

  .label {
    white-space: nowrap;
  }

  /* Responsive sizing */
  @media (max-width: 480px) {
    .action-button {
      min-width: 100px;
      height: 44px;
      padding: 0 var(--spacing-md);
      font-size: var(--font-size-sm);
    }
  }
</style>
