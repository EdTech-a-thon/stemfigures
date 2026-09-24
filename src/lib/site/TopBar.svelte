<script lang="ts">
  // On every page: the STEM Figures name (back to the directory) and the
  // teacher.dev credit linking out to teacher.dev.
  import { SITE_NAME } from './config'
</script>

<header class="topbar no-print">
  <a class="home" href="/">
    <img src="/favicon.svg" alt="" width="28" height="28" />
    <span>{SITE_NAME}</span>
  </a>
  <a class="built" href="https://teacher.dev" target="_blank" rel="noopener noreferrer">
    <img src="/logo.svg" alt="" width="22" height="22" />
    <span>Built by teacher.dev</span>
  </a>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    height: var(--topbar-h);
    padding: 0 1.25rem;
    background: #fff;
    border-bottom: 1px solid var(--border);
  }
  .home { display: inline-flex; align-items: center; gap: 0.55rem; color: var(--ink); text-decoration: none; font-weight: 800; font-size: 1.1rem; white-space: nowrap; }
  .built { display: inline-flex; align-items: center; gap: 0.5rem; flex: none; color: var(--muted); font-size: 0.9rem; text-decoration: none; white-space: nowrap; }
  .built:hover span { text-decoration: underline; text-underline-offset: 3px; }
  @media (max-width: 380px) {
    .built span { display: none; }
  }
</style>
