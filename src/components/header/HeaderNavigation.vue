<template>
  <header id="header">
    <div class="header-wrapper">
      <HeaderNavList />
      <HeaderNavProfile />
    </div>
  </header>
</template>

<script setup lang="ts">
import HeaderNavList from "./HeaderNavList.vue";
import HeaderNavProfile from "./HeaderNavProfile.vue";

// Импорты
</script>

<style scoped>
.header-wrapper {
  display: flex;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--primary-color);
  padding: 8px 16px;
  margin-bottom: 20px;
}
</style>
