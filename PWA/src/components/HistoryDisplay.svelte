<script lang="ts">
  import { type OnePlay } from '$game-engine/index';
  import { getPrintedNumber, getOpString } from '$game-engine/index';
  import { t } from '$utils/i18n';

  interface Props {
    /** Array of plays to display */
    plays?: readonly OnePlay[];
    /** Whether to show the history */
    show?: boolean;
  }

  let {
    plays = [],
    show = true,
  }: Props = $props();

  /** Format a single play for display */
  function formatPlay(play: OnePlay): string {
    // Get the actual number values from the indices
    const num1 = getPrintedNumber(play.numbersPre[play.first]);
    const num2 = getPrintedNumber(play.numbersPre[play.second]);
    const op = getOpString(play.op);
    
    // The result is at index 'first' in numbersPost, BUT if second < first,
    // then after removing second, the first index shifts down by 1
    const resultIndex = play.second < play.first ? play.first - 1 : play.first;
    const result = getPrintedNumber(play.numbersPost[resultIndex]);
    
    return `${num1} ${op} ${num2} = ${result}`;
  }
</script>

{#if show && plays.length > 0}
  <div class="history-display">
    <h3 class="history-title">{t('historyTitle')}</h3>
    
    <div class="history-list">
      {#each plays as play, index (index)}
        <div class="history-item">
          <span class="play-number">{index + 1}.</span>
          <span class="play-formula">{formatPlay(play)}</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .history-display {
    /* Layout */
    background: white;
    border-radius: var(--border-radius-lg);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: var(--spacing-md);
    max-height: 200px;
    overflow-y: auto;
    
    /* Responsive width */
    width: 100%;
    max-width: 400px;
  }

  .history-title {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    font-weight: 600;
    color: var(--color-text-secondary);
    margin: 0 0 var(--spacing-sm) 0;
    text-align: center;
    direction: rtl;
    
    /* Border */
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid #e0e0e0;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .history-item {
    /* Layout */
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    background: #f5f5f5;
    transition: background 0.2s ease;
    direction: rtl;
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
  }

  .history-item:hover {
    background: #eeeeee;
  }

  .play-number {
    /* Layout */
    min-width: 24px;
    text-align: left;
    
    /* Typography */
    font-weight: 600;
    color: var(--color-text-secondary);
  }

  .play-formula {
    /* Typography */
    font-family: 'Courier New', monospace;
    color: var(--color-text-primary);
    flex: 1;
    direction: ltr;
    text-align: left;
  }

  /* Scrollbar styling */
  .history-display::-webkit-scrollbar {
    width: 8px;
  }

  .history-display::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--border-radius-sm);
  }

  .history-display::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: var(--border-radius-sm);
  }

  .history-display::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .history-display {
      max-height: 150px;
      padding: var(--spacing-sm);
    }

    .history-title {
      font-size: var(--font-size-sm);
    }

    .history-item {
      font-size: var(--font-size-xs);
    }
  }
</style>
