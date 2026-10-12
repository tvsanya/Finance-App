<template>
  <div class="nav_profile">
    <div class="nav_profile-item">
      <button
        type="button"
        class="nav_profile-theme"
        :class="{ 'nav_profile-theme--dark': isDark }"
        :title="
          isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'
        "
        :aria-label="
          isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'
        "
        @click="toggleTheme"
      >
        <span class="nav_profile-theme-icon">
          {{ isDark ? "☀️" : "🌙" }}
        </span>
        <span class="nav_profile-theme-text">
          {{ isDark ? "Светлая" : "Тёмная" }}
        </span>
      </button>
      <p>Профиль</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../../composable/useTheme';

const {isDark, toggleTheme} = useTheme()
</script>

<style scoped>
.nav_profile {
  display: flex;
  justify-content: space-around;
}

.nav_profile-item {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav_profile-theme {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 22px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  font-family: inherit;
}

.nav_profile-theme:hover {
  border-color: #4CAF50;
  background: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
}

.nav_profile-theme:active {
  transform: translateY(0);
}

.nav_profile-theme-icon {
  font-size: 1.1rem;
  transition: transform 0.4s ease;
  display: inline-block;
}

.nav_profile-theme:hover .nav_profile-theme-icon {
  transform: rotate(20deg);
}

.nav_profile-theme--dark:hover .nav_profile-theme-icon {
  transform: rotate(-20deg);
}

.nav_profile-theme-text {
  font-size: 0.85rem;
}
</style>
