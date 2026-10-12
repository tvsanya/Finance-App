<template>
  <div class="tabs-wrapper">
    <ul class="tabs-filters">
      <li class="tabs-filters_item">
        <button
          id="filters-btn"
          :class="{ 'filters-btn--active': currentFilter === 'all' }"
          @click="setFilter('all')"
        >
          Все
        </button>
      </li>
      <li class="tabs-filters_item">
        <button
          id="filters-btn"
          :class="{ 'filters-btn--active': currentFilter === 'income' }"
          @click="setFilter('income')"
        >
          Доходы
        </button>
      </li>
      <li class="tabs-filters_item">
        <button
          id="filters-btn"
          :class="{ 'filters-btn--active': currentFilter === 'expense' }"
          @click="setFilter('expense')"
        >
          Расходы
        </button>
      </li>
    </ul>
    <ul class="tabs-list" v-if="transactions.length > 0">
      <TransactionItem
        v-for="transaction in transactions"
        :key="transaction.id"
        :transaction="transaction"
        @delete="handleDelete"
      />
    </ul>
    <div class="delete-all-wrapper">
      <button
        v-if="transactions.length > 0"
        class="delete-all-btn"
        @click="confirmDeleteAll"
        title="Удалить все транзакции"
      >
        Удалить всё
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Transaction } from '../services/database.service';
import TransactionItem from "./TransactionItem.vue";

const props = defineProps<{
  transactions: Transaction[];
}>();

const currentFilter = ref("all");

const emit = defineEmits<{
  (e: "filter-change", filter: string): void;
  (e: "delete-transaction", id: number): void;
  (e: "delete-all-transactions"): void;
}>();

function setFilter(filter: string) {
  currentFilter.value = filter;
  emit("filter-change", filter);
}

function handleDelete(id: number) {
  emit("delete-transaction", id);
}

function confirmDeleteAll() {
  if (confirm("Вы уверены, что хотите удалить ВСЕ транзакции?")) {
    emit("delete-all-transactions");
  }
}
</script>

<style scoped>
.tabs-wrapper {
  display: flex;
  flex-direction: column;
  padding: 16px 24px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--primary-color);
  width: 100%;
}

.tabs-filters {
  display: flex;
  gap: 16px;
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 0 8px;
  margin-bottom: 10px;
}

.tabs-item {
  background: var(--bg-primary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  padding: 0 8px;
}

.delete-all-wrapper{
  display: flex;
  justify-content: center;
}

#filters-btn {
  padding: 6px 16px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
  border-radius: 6px;
  transition: all 0.3s;
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-normal);
}

#filters-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.filters-btn--active {
  background: var(--primary-color);
  font-weight: var(--font-semibold);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.delete-all-btn{
  padding: 4px 16px;
  border-radius: 8px;
  background-color: var(--bg-primary);
  transition: all .3s;
}

.delete-all-btn:hover{
  background-color: red;
  color: #ffffff;
}
</style>
