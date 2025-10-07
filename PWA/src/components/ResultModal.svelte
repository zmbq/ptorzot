<script lang="ts">
  import { vibratePattern } from '$utils/vibration';
  import { settingsStore } from '$stores/index';
  import { t } from '$utils/i18n';

  interface Props {
    /** Whether the modal is shown */
    show: boolean;
    /** Whether the result is correct */
    correct: boolean;
    /** The target number */
    target?: number;
    /** The result achieved */
    result?: number;
    /** Callback for "New Game" button */
    onnewgame?: () => void;
    /** Callback for "Try Again" button */
    ontryagain?: () => void;
  }

  let {
    show = $bindable(false),
    correct,
    target,
    result,
    onnewgame,
    ontryagain,
  }: Props = $props();

  /** Trigger vibration when modal is shown */
  $effect(() => {
    if (show) {
      if (correct) {
        vibratePattern('celebration', $settingsStore.vibrationEnabled);
      } else {
        vibratePattern('error', $settingsStore.vibrationEnabled);
      }
    }
  });

  /** Handle new game */
  function handleNewGame() {
    vibratePattern('button', $settingsStore.vibrationEnabled);
    onnewgame?.();
    show = false;
  }

  /** Handle try again */
  function handleTryAgain() {
    vibratePattern('button', $settingsStore.vibrationEnabled);
    ontryagain?.();
    show = false;
  }

  /** Handle backdrop click */
  function handleBackdropClick() {
    // Don't allow closing result modal by clicking backdrop
    // User must choose an action
  }
</script>

{#if show}
  <div class="result-modal-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
    <div class="result-modal" class:correct class:wrong={!correct}>
      <div class="result-icon">
        {#if correct}
          <span class="icon-success">✓</span>
        {:else}
          <span class="icon-error">✗</span>
        {/if}
      </div>
      
      <h2 class="result-title">
        {correct ? t('right') : t('wrong')}
      </h2>
      
      <div class="result-details">
        {#if target !== undefined}
          <div class="detail-row">
            <span class="detail-label">{t('mission')}</span>
            <span class="detail-value">{target}</span>
          </div>
        {/if}
        {#if result !== undefined}
          <div class="detail-row">
            <span class="detail-label">התוצאה שלך:</span>
            <span class="detail-value">{result}</span>
          </div>
        {/if}
      </div>
      
      <div class="actions">
        <button
          class="action-button primary"
          onclick={handleNewGame}
          type="button"
        >
          {t('newgame')}
        </button>
        
        {#if !correct}
          <button
            class="action-button secondary"
            onclick={handleTryAgain}
            type="button"
          >
            {t('tryagain')}
          </button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .result-modal-backdrop {
    /* Full screen overlay */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000;
    
    /* Backdrop */
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    
    /* Center content */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
    
    /* Animation */
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .result-modal {
    /* Layout */
    background: white;
    border-radius: var(--border-radius-xl);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
    padding: var(--spacing-xxl);
    max-width: 400px;
    width: 100%;
    
    /* Center content */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-lg);
    
    /* Animation */
    animation: bounceIn 0.5s ease;
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .result-modal.correct {
    border: 4px solid #4caf50;
  }

  .result-modal.wrong {
    border: 4px solid #f44336;
  }

  .result-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 700;
  }

  .icon-success {
    color: #4caf50;
    animation: pulse 1s ease infinite;
  }

  .icon-error {
    color: #f44336;
    animation: shake 0.5s ease;
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  @keyframes shake {
    0%, 100% {
      transform: translateX(0);
    }
    10%, 30%, 50%, 70%, 90% {
      transform: translateX(-10px);
    }
    20%, 40%, 60%, 80% {
      transform: translateX(10px);
    }
  }

  .result-title {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xxl);
    font-weight: 700;
    margin: 0;
    text-align: center;
    direction: rtl;
  }

  .result-modal.correct .result-title {
    color: #4caf50;
  }

  .result-modal.wrong .result-title {
    color: #f44336;
  }

  .result-details {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }

  .detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    background: #f5f5f5;
    border-radius: var(--border-radius-md);
    font-family: var(--font-family);
    direction: rtl;
  }

  .detail-label {
    font-size: var(--font-size-sm);
    color: var(--color-text-secondary);
  }

  .detail-value {
    font-size: var(--font-size-lg);
    font-weight: 700;
    color: var(--color-primary);
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
  }

  .action-button {
    /* Reset */
    border: none;
    margin: 0;
    cursor: pointer;
    
    /* Layout */
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    width: 100%;
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    font-weight: 600;
    color: white;
    direction: rtl;
    
    /* Styling */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s ease;
  }

  .action-button.primary {
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  }

  .action-button.secondary {
    background: linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%);
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .action-button:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .result-modal {
      padding: var(--spacing-xl);
    }

    .result-icon {
      width: 60px;
      height: 60px;
      font-size: 36px;
    }

    .result-title {
      font-size: var(--font-size-xl);
    }
  }
</style>
