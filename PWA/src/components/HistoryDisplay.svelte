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
    try {
      // Get the actual number values from the indices
      const num1 = getPrintedNumber(play.numbersPre[play.first]);
      const num2 = getPrintedNumber(play.numbersPre[play.second]);
      const op = getOpString(play.op);
      
      // The result is at index 'first' in numbersPost, BUT if second < first,
      // then after removing second, the first index shifts down by 1
      const resultIndex = play.second < play.first ? play.first - 1 : play.first;
      const result = getPrintedNumber(play.numbersPost[resultIndex]);
      
      return `${num1} ${op} ${num2} = ${result}`;
    } catch (error) {
      console.error('formatPlay error:', error, play);
      return 'Error formatting play';
    }
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
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%);
    backdrop-filter: blur(10px);
    border-radius: var(--border-radius-lg);
    box-shadow: 
      0 4px 12px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.2);
    padding: clamp(0.5rem, 2vh, 0.75rem);
    
    /* Let it grow to fit content, up to max */
    display: flex;
    flex-direction: column;
    max-height: min(25vh, 200px); /* Responsive max based on viewport */
    
    /* Responsive width */
    width: 100%;
    max-width: 400px;
  }

  .history-title {
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
    margin: 0 0 var(--spacing-xs) 0;
    text-align: center;
    direction: rtl;
    
    /* Border */
    padding-bottom: var(--spacing-xs);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    
    /* Don't shrink */
    flex-shrink: 0;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    
    /* Allow scrolling */
    overflow-y: auto;
    flex: 1 1 auto;
    min-height: 0;
  }

  .history-item {
    /* Layout */
    display: flex;
    gap: var(--spacing-xs);
    padding: 4px var(--spacing-xs);
    border-radius: var(--border-radius-sm);
    background: rgba(255, 255, 255, 0.15);
    transition: background 0.2s ease;
    direction: rtl;
    
    /* Typography */
    font-family: var(--font-family);
    font-size: var(--font-size-xs);
  }

  .history-item:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  .play-number {
    /* Layout */
    min-width: 24px;
    text-align: left;
    
    /* Typography */
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
  }

  .play-formula {
    /* Typography */
    font-family: 'Courier New', monospace;
    color: rgba(255, 255, 255, 0.95);
    flex: 1;
    direction: ltr;
    text-align: left;
  }

  /* Scrollbar styling */
  .history-list::-webkit-scrollbar {
    width: 8px;
  }

  .history-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: var(--border-radius-sm);
  }

  .history-list::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: var(--border-radius-sm);
  }

  .history-list::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .history-display {
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
