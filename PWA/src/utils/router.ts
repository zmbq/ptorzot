import { writable } from 'svelte/store';

export interface Route {
  path: string;
  component: any;
}

function createRouter() {
  const { subscribe, set } = writable<string>(window.location.pathname);

  // Listen to browser navigation
  window.addEventListener('popstate', () => {
    set(window.location.pathname);
  });

  return {
    subscribe,
    navigate: (path: string) => {
      window.history.pushState({}, '', path);
      set(path);
    },
    replace: (path: string) => {
      window.history.replaceState({}, '', path);
      set(path);
    }
  };
}

export const router = createRouter();

export function navigate(path: string) {
  router.navigate(path);
}

export function replace(path: string) {
  router.replace(path);
}
