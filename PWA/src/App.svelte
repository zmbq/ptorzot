<script lang="ts">
  import Router from './components/Router.svelte';
  import GameView from './routes/GameView.svelte';
  
  const routes = [
    { path: '/', component: GameView },
    // Additional routes will be added here
    // { path: '/result', component: ResultView },
    // { path: '/settings', component: SettingsView },
  ];
</script>

<div class="app">
  <main>
    <Router {routes} />
  </main>
</div>

<style>
  .app {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
