<script lang="ts">
  import { GameLevel, getAllLevelConfigs } from '$game-engine/index';
  import { settingsStore } from '$stores/index';
  import { vibratePattern } from '$utils/vibration';
  import { t } from '$utils/i18n';

  interface Props {
    /** Whether the selector is shown */
    show: boolean;
    /** Current selected level */
    currentLevel?: GameLevel;
    /** Callback when level is selected */
    onselect?: (level: GameLevel) => void;
    /** Callback when cancelled */
    oncancel?: () => void;
  }

  let {
    show = $bindable(false),
    currentLevel,
    onselect,
    oncancel,
  }: Props = $props();

  /** All level configurations */
  const levels = getAllLevelConfigs();

  /** Handle level selection */
  function selectLevel(level: GameLevel) {
    vibratePattern('button', $settingsStore.vibrationEnabled);
    onselect?.(level);
    show = false;
  }

  /** Handle cancel */
  function cancel() {
    vibratePattern('button', $settingsStore.vibrationEnabled);
    oncancel?.();
    show = false;
  }

  /** Handle backdrop click */
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      cancel();
    }
  }
</script>

{#if show}
  <div class="level-selector-backdrop" onclick={handleBackdropClick} role="dialog" aria-modal="true">
    <div class="level-selector">
      <h2 class="title">{t('levels_title')}</h2>
      
      <div class="levels-grid">
        {#each levels as levelConfig (levelConfig.level)}
          <button
            class="level-option"
            class:selected={currentLevel === levelConfig.level}
            data-color={levelConfig.color}
            onclick={() => selectLevel(levelConfig.level)}
            type="button"
          >
            <div class="level-name">{levelConfig.name}</div>
            <div class="level-description">{levelConfig.nameLong}</div>
            <div class="level-range">
              {levelConfig.minTarget} - {levelConfig.maxTarget}
            </div>
          </button>
        {/each}
      </div>
      
      <div class="actions">
        <button
          class="cancel-button"
          onclick={cancel}
          type="button"
        >
          {t('cancel')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .level-selector-backdrop {
    /* Full screen overlay */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    
    /* Backdrop */
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    
    /* Center content */
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
    
    /* Animation */
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .level-selector {
    /* Layout */
    background: white;
    border-radius: var(--border-radius-lg);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    padding: var(--spacing-xl);
    max-width: 500px;
    width: 100%;
    
    /* Animation */
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .title {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--color-text);
    text-align: center;
    margin: 0 0 var(--spacing-lg) 0;
    
    /* RTL */
    direction: rtl;
  }

  .levels-grid {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
  }

  .level-option {
    /* Reset */
    border: none;
    margin: 0;
    cursor: pointer;
    
    /* Layout */
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-xs);
    
    /* Styling */
    background: #f5f5f5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    
    /* Typography */
    font-family: var(--font-family);
    color: white;
  }

  .level-option[data-color='green'] {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }

  .level-option[data-color='yellow'] {
    background: linear-gradient(135deg, #ffc107 0%, #f57c00 100%);
  }

  .level-option[data-color='red'] {
    background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
  }

  .level-option:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .level-option:active {
    transform: translateY(0);
  }

  .level-option.selected {
    box-shadow: 
      0 0 0 3px rgba(255, 215, 0, 0.7),
      0 4px 8px rgba(0, 0, 0, 0.2);
    transform: scale(1.02);
  }

  .level-name {
    font-size: var(--font-size-lg);
    font-weight: 700;
    direction: rtl;
  }

  .level-description {
    font-size: var(--font-size-sm);
    font-weight: 400;
    opacity: 0.9;
    direction: rtl;
  }

  .level-range {
    font-size: var(--font-size-xs);
    opacity: 0.8;
    margin-top: var(--spacing-xs);
  }

  .actions {
    display: flex;
    justify-content: center;
  }

  .cancel-button {
    /* Reset */
    border: none;
    margin: 0;
    cursor: pointer;
    
    /* Layout */
    padding: var(--spacing-md) var(--spacing-xl);
    border-radius: var(--border-radius-md);
    
    /* Styling */
    background: linear-gradient(135deg, #999 0%, #777 100%);
    color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    font-weight: 600;
    
    /* Transitions */
    transition: all 0.2s ease;
    direction: rtl;
  }

  .cancel-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .cancel-button:active {
    transform: translateY(0);
  }

  /* Responsive */
  @media (max-width: 480px) {
    .level-selector {
      padding: var(--spacing-lg);
    }

    .title {
      font-size: var(--font-size-lg);
    }

    .level-option {
      padding: var(--spacing-md);
    }
  }
</style>
