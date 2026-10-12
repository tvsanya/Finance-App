<template>
  <li class="transaction-info">
    <article class="transaction-header">
      <h3 class="transaction-card__title font-mono">{{ transaction.type }}</h3>
      <div class="transaction-card">
        <span
          class="transaction-card__amount"
          :class="`transaction-card__amount--${transaction.category}`"
        >
          {{ transaction.category === "income" ? "+" : "-"
          }}{{ transaction.amount }} ₽
        </span>
        <button
          class="transaction-card__delete-btn"
          @click="confirmDelete"
          title="Удалить транзакцию"
        >
          ✕
        </button>
      </div>
    </article>
    <div class="transaction-details">
      <span class="transaction-details__date">{{ formatDate(transaction.date) }}</span>
      <span v-if="transaction.description" class="transaction-details__description">
        {{ transaction.description }}
      </span>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Transaction } from '../services/database.service';

const props = defineProps<{
  transaction: Transaction;
}>();

const emit = defineEmits<{
  (e: "delete", id: number): void;
}>();

function confirmDelete() {
  if (!props.transaction.id) return
  
  if (confirm("Вы уверены, что хотите удалить эту транзакцию?")) {
    emit("delete", props.transaction.id);
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
</script>

<style scoped>
.transaction-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.transaction-card {
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: center;
}

.transaction-card__title {
  font-weight: 500;
}

.transaction-card__amount {
  font-weight: bold;
}

.transaction-card__amount--income {
  color: #4caf50;
}

.transaction-card__amount--expense {
  color: #f44336;
}

.transaction-card__delete-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  transition: all 0.3s;
  padding: 0;
}

.transaction-card__delete-btn:hover {
  background: #f44336;
  color: white;
  border-color: #f44336;
  transform: scale(1.1);
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.transaction-details__date {
  white-space: nowrap;
  font-weight: var(--font-medium);
}

.transaction-details__description {
  margin: 0;
  color: var(--text-secondary);
  font-weight: var(--font-regular);
}
</style>
