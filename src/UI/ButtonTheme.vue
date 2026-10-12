<template>
  <button
    type="button"
    class="theme-toggle"
    :class="{ 'theme-toggle--dark': isDark }"
    :title="
      isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'
    "
    :aria-label="
      isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'
    "
    :aria-pressed="isDark"
    role="switch"
    @click="toggleTheme"
  >
    <span class="theme-toggle__thumb"></span>
  </button>
</template>

<script setup lang="ts">
import { useTheme } from "../composable/useTheme";

const { isDark, toggleTheme } = useTheme();
</script>

<style scoped>
.theme-toggle {
  position: relative;
  width: 60px;
  height: 32px;
  padding: 0;
  background: #cbd5e1;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  transition: background-color 0.4s ease;
  outline: none;
  flex-shrink: 0;
}

.theme-toggle:hover {
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
}

.theme-toggle:focus-visible {
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.4);
}

.theme-toggle--dark {
  background: #1e3a5f;
}

.theme-toggle__thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 26px;
  height: 26px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55),
    background-color 0.4s ease;
}

.theme-toggle--dark .theme-toggle__thumb {
  transform: translateX(28px);
  background: #1e1e1e;
}

.theme-toggle:active .theme-toggle__thumb {
  width: 30px;
}
</style>
