<script lang="ts">
  import { targetNumber, currentLevel } from '$stores/index';
  import { getLevelConfig } from '$game-engine/index';
  import { t } from '$utils/i18n';

  /** Get level configuration */
  const levelConfig = $derived($currentLevel ? getLevelConfig($currentLevel) : null);
  
  /** Get level color */
  const levelColor = $derived(levelConfig?.color ?? 'green');
  
  /** Get level name */
  const levelName = $derived(levelConfig?.name ?? '');
</script>

<div class="target-display" data-level-color={levelColor}>
  <div class="mission-text">
    {t('mission')}
  </div>
  
  <div class="target-number">
    {$targetNumber ?? '—'}
  </div>
  
  {#if levelName}
    <div class="level-badge" data-color={levelColor}>
      {levelName}
    </div>
  {/if}
</div>

<style>
  .target-display {
    /* Layout */
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    
    /* Styling */
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.85) 100%);
    border-radius: var(--border-radius-lg);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
    
    /* Responsive width */
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .mission-text {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    font-weight: 500;
    color: var(--color-text-secondary);
    text-align: center;
    
    /* RTL support */
    direction: rtl;
  }

  .target-number {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xxxl);
    font-weight: 700;
    color: var(--color-primary);
    text-align: center;
    line-height: 1;
    
    /* Styling */
    padding: var(--spacing-sm) var(--spacing-lg);
    background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(139, 69, 19, 0.05) 100%);
    border-radius: var(--border-radius-md);
    min-width: 100px;
  }

  .level-badge {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: white;
    text-align: center;
    
    /* Layout */
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--border-radius-full);
    
    /* RTL support */
    direction: rtl;
  }

  .level-badge[data-color='green'] {
    background: linear-gradient(135deg, #4caf50 0%, #388e3c 100%);
  }

  .level-badge[data-color='yellow'] {
    background: linear-gradient(135deg, #ffc107 0%, #f57c00 100%);
  }

  .level-badge[data-color='red'] {
    background: linear-gradient(135deg, #f44336 0%, #c62828 100%);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .target-display {
      padding: var(--spacing-md);
    }

    .mission-text {
      font-size: var(--font-size-sm);
    }

    .target-number {
      font-size: var(--font-size-xxl);
    }
  }

  @media (max-width: 480px) {
    .target-display {
      padding: var(--spacing-sm);
    }

    .target-number {
      font-size: var(--font-size-xl);
    }
  }
</style>
