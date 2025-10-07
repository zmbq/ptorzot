<script lang="ts">
  // Game View - Main game screen
  // This will be implemented with the full game logic
</script>

<div class="game-view">
  <div class="title">
    <h1>פתור זאת</h1>
    <p>PtorZot - Mathematical Puzzle Game</p>
  </div>
  
  <div class="coming-soon">
    <p>🎮 Game UI coming soon...</p>
    <p>The game engine and components will be built next!</p>
  </div>
</div>

<style>
  .game-view {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-lg);
    background: linear-gradient(135deg, #f5f5dc 0%, #e8e8d0 100%);
  }

  .title {
    text-align: center;
    margin-bottom: var(--spacing-xl);
  }

  .title h1 {
    font-size: var(--font-size-3xl);
    color: var(--color-primary);
    margin-bottom: var(--spacing-sm);
  }

  .title p {
    font-size: var(--font-size-lg);
    color: var(--color-text);
    opacity: 0.8;
  }

  .coming-soon {
    background: white;
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    text-align: center;
  }

  .coming-soon p {
    font-size: var(--font-size-lg);
    margin: var(--spacing-sm) 0;
  }

  .coming-soon p:first-child {
    font-size: var(--font-size-2xl);
  }
</style>
