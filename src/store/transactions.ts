import { ref, computed } from "vue";
import { transactionService } from "../services/transaction.service";
import { databaseService } from "../services/database.service";
import type { Transaction } from "../services/database.service";
import type { NewTransaction } from "../types/transaction";

const transactions = ref<Transaction[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

export function useTransactions() {
  const balance = computed(() => {
    return transactions.value.reduce((acc, t) => {
      return acc + (t.category === "income" ? t.amount : -t.amount);
    }, 0);
  });

  const income = computed(() => {
    return transactions.value
      .filter((t) => t.category === "income")
      .reduce((acc, t) => acc + t.amount, 0);
  });

  const expenses = computed(() => {
    return transactions.value
      .filter((t) => t.category === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
  });

  async function init(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      await databaseService.init();
      await refresh();
    } catch (e) {
      error.value = "Failed to initialize database";
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  async function refresh(filter?: string): Promise<void> {
    try {
      transactions.value = await transactionService.getTransactions(filter);
    } catch (e) {
      error.value = "Failed to load transactions";
      console.error(e);
    }
  }

  async function addTransaction(transaction: NewTransaction): Promise<void> {
    try {
      const created = await transactionService.addTransaction(transaction);
      transactions.value.unshift(created);
    } catch (e) {
      error.value = "Failed to add transaction";
      console.error(e);
      throw e;
    }
  }

  async function updateTransaction(
    id: number,
    updates: Partial<Transaction>,
  ): Promise<void> {
    try {
      await transactionService.updateTransaction(id, updates);
      await refresh();
    } catch (e) {
      error.value = "Failed to update transaction";
      console.error(e);
      throw e;
    }
  }

  async function deleteTransaction(id: number): Promise<void> {
    try {
      await transactionService.deleteTransaction(id);
      transactions.value = transactions.value.filter((t) => t.id !== id);
    } catch (e) {
      error.value = "Failed to delete transaction";
      console.error(e);
      throw e;
    }
  }

  async function deleteAllTransactions(): Promise<void> {
    try {
      await transactionService.deleteAllTransactions();
      transactions.value = [];
    } catch (e) {
      error.value = "Failed to delete all transactions";
      console.error(e);
      throw e;
    }
  }

  function getTransactions(filter?: string): Transaction[] {
    if (!filter || filter === "all") {
      return transactions.value;
    }
    return transactions.value.filter((t) => t.category === filter);
  }

  return {
    transactions,
    balance,
    income,
    expenses,
    isLoading,
    error,
    init,
    refresh,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteAllTransactions,
    getTransactions,
  };
}
