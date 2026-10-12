<template>
  <HeaderNavigation />
  <main id="main">
    <div class="container">
      <div v-if="isLoading" class="loading-state">
        <p class="loading-state__text">Загрузка данных...</p>
      </div>
      <template v-else>
        <section class="balance-section">
          <ul class="balance-section__list">
            <li class="balance-section__item">
              <acticle class="balance-card">
                <h2 class="balance-card__label">Общий Баланс:</h2>
                <p class="balance-card__value font-mono">{{ balance }} ₽</p>
              </acticle>
            </li>
            <li class="balance-section__item">
              <acticle class="balance-card">
                <h2 class="balance-card__label">Общий Доход:</h2>
                <p
                  class="balance-card__value balance-card__value--income font-mono"
                >
                  {{ income }} ₽
                </p>
              </acticle>
            </li>
            <li class="balance-section__item">
              <acticle class="balance-card">
                <h2 class="balance-card__label">Общий Расход:</h2>
                <p
                  class="balance-card__value balance-card__value--expense font-mono"
                >
                  {{ expenses }} ₽
                </p>
              </acticle>
            </li>
          </ul>
          <AddTransaction @transaction-added="handleTransactionAdded" />
          <TabsTransactions
            :transactions="filteredTransactions"
            @filter-change="updateFilter"
            @delete-transaction="handleDeleteTransaction"
            @delete-all-transactions="handleDeleteAllTransactions"
          />
          <Dashboard />
          <ReportGenerator/>
        </section>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import HeaderNavigation from "./header/HeaderNavigation.vue";
import AddTransaction from "./AddTransaction.vue";
import TabsTransactions from "./TabsTransactions.vue";
import ReportGenerator from "./ReportGenerator.vue";
import Dashboard from "../UI/Dashboard.vue";
import { useTransactions } from "../store/transactions.ts";
import type { Transaction } from "../services/database.service.ts";


const {
  balance,
  income,
  expenses,
  isLoading,
  init,
  addTransaction,
  deleteTransaction,
  deleteAllTransactions,
  getTransactions,
} = useTransactions();

const currentFilter = ref("all");

const filteredTransactions = computed(() => {
  return getTransactions(currentFilter.value);
});

onMounted(async () => {
  await init();
});

async function handleTransactionAdded(
  transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
) {
  await addTransaction(transaction);
}

function updateFilter(filter: string) {
  currentFilter.value = filter;
}

async function handleDeleteTransaction(id: number) {
  await deleteTransaction(id);
}

async function handleDeleteAllTransactions() {
  await deleteAllTransactions();
}
</script>

<style scoped>
.balance-section {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.balance-section__list {
  display: flex;
  gap: 24px;
}

.balance-section__item {
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 24px;
  background: var(--primary-color);
  width: 300px;
  height: 200px;
}

.balance-card__value--income {
  color: #4caf50;
}

.balance-card__value--expense {
  color: #f44336;
}
</style>
