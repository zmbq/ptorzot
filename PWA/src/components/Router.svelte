<script lang="ts">
  import type { Route } from '../utils/router';
  import { router } from '../utils/router';
  
  interface Props {
    routes: Route[];
  }
  
  let { routes }: Props = $props();
  
  // Get current path from router store
  let currentPath = $state('/');
  
  $effect(() => {
    const unsubscribe = router.subscribe(path => {
      currentPath = path;
    });
    
    return unsubscribe;
  });
  
  // Find matching route
  let currentRoute = $derived(
    routes.find(route => {
      if (route.path === currentPath) return true;
      // Add support for wildcard matching later if needed
      return false;
    }) || routes[0] // Default to first route if no match
  );
</script>

<div class="router">
  {#if currentRoute}
    {@const Component = currentRoute.component}
    <Component />
  {/if}
</div>

<style>
  .router {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
