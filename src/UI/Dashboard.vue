<template>
  <section class="dashboard" aria-label="Дашборд с графиками">
    <div class="dashboard__controls">
      <div class="dashboard__mode-switch">
        <button
          v-for="option in chartModes"
          :key="option.value"
          type="button"
          class="dashboard__mode-btn"
          :class="{ 'dashboard__mode-btn--active': chartMode === option.value }"
          @click="chartMode = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="dashboard__period-switch">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          type="button"
          class="dashboard__period-btn"
          :class="{ 'dashboard__period-btn--active': period === option.value }"
          @click="period = option.value"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
    <div class="dashboard__card">
      <h3 class="dashboard__card-title">{{ currentChartTitle }}</h3>
      <div class="dashboard__chart-wrapper">
        <div v-if="isLoading" class="dashboard__loader">
          <span class="dashboard__spinner"></span>
          Загрузка данных...
        </div>
        <Line v-else :data="lineChartData" :options="lineChartOptions"/>
      </div>
      <div class="dashboard__grid">
        <div class="dashboard__card">
          <h3 class="dashboard__card-title">Доходы по категориям</h3>
          <div class="dashboard__chart-wrapper dashboaard__chart-wrapper--small">
            <Doughnut
              v-if="incomeByType.labels.length > 0"
              :data="incomeDoughnutData"
              :options="doughnutOptions"
            />
            <p v-else class="dashboard__empty">Нет данных о доходах</p>
          </div>
        </div>
        <div class="dashboard__card">
          <h3 class="dashboard__card-title">Расходы по категориям</h3>
          <div
            class="dashboard__chart-wrapper dashboard__chart-wrapper--small"
          >
            <Doughnut
              v-if="expensesByType.labels.length > 0"
              :data="expensesDoughnutData"
              :options="doughnutOptions"
            />
            <p v-else class="dashboard__empty">Нет данных о расходах</p>
          </div>
        </div>
        <div class="dashboard__card-balance">
        <h3 class="dashboard__balance-title">Динамика баланса</h3>
        <div class="dashboard__chart-wrapper">
          <Bar :data="balanceBarData" :options="barChartOptions" />
        </div>
      </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { Doughnut, Line, Bar } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { statisticsService } from "../services/statistics.service";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type ChartMode = "both" | "income" | "expenses" | "balance";
type Period = "week" | "month" | "quarter" | "year";

// Реактивные данные
const isLoading = ref(true);
const chartMode = ref<ChartMode>("both");
const period = ref<Period>("month");

const stats = ref({
  labels: [] as string[],
  income: [] as number[],
  expenses: [] as number[],
  balance: [] as number[],
});

const incomeByType = ref({ labels: [] as string[], data: [] as number[] });
const expensesByType = ref({ labels: [] as string[], data: [] as number[] });

// Опции переключателей
const chartModes = [
  { value: "both" as ChartMode, label: "Доходы и расходы" },
  { value: "income" as ChartMode, label: "Только доходы" },
  { value: "expenses" as ChartMode, label: "Только расходы" },
  { value: "balance" as ChartMode, label: "Баланс" },
];

const periodOptions = [
  { value: "week" as Period, label: "Неделя" },
  { value: "month" as Period, label: "Месяц" },
  { value: "quarter" as Period, label: "Квартал" },
  { value: "year" as Period, label: "Год" },
];

// Цвета
const COLORS = {
  income: "#4CAF50",
  incomeLight: "rgba(76, 175, 80, 0.2)",
  expenses: "#F44336",
  expensesLight: "rgba(244, 67, 54, 0.2)",
  balance: "#2196F3",
  balanceLight: "rgba(33, 150, 243, 0.2)",
};

const doughnutColors = [
  "#4CAF50",
  "#2196F3",
  "#FF9800",
  "#9C27B0",
  "#F44336",
  "#00BCD4",
  "#FFEB3B",
  "#795548",
  "#607D8B",
  "#E91E63",
  "#3F51B5",
  "#009688",
  "#FF5722",
  "#8BC34A",
  "#673AB7",
];

// Заголовок текущего графика
const currentChartTitle = computed(() => {
  const titles: Record<ChartMode, string> = {
    both: "Доходы и расходы",
    income: "Динамика доходов",
    expenses: "Динамика расходов",
    balance: "Динамика баланса",
  };
  return titles[chartMode.value];
});

// Данные для линейного графика
const lineChartData = computed(() => {
  const datasets: any[] = [];

  if (chartMode.value === "both" || chartMode.value === "income") {
    datasets.push({
      label: "Доходы",
      data: stats.value.income,
      borderColor: COLORS.income,
      backgroundColor: COLORS.incomeLight,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: COLORS.income,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  if (chartMode.value === "both" || chartMode.value === "expenses") {
    datasets.push({
      label: "Расходы",
      data: stats.value.expenses,
      borderColor: COLORS.expenses,
      backgroundColor: COLORS.expensesLight,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: COLORS.expenses,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  if (chartMode.value === "balance") {
    datasets.push({
      label: "Баланс",
      data: stats.value.balance,
      borderColor: COLORS.balance,
      backgroundColor: COLORS.balanceLight,
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: COLORS.balance,
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    });
  }

  return {
    labels: stats.value.labels,
    datasets,
  };
});

// Опции для линейного графика
const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top" as const,
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 13,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      cornerRadius: 6,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || "";
          if (label) {
            label += ": ";
          }
          label += context.parsed.y.toFixed(2) + " ₽";
          return label;
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toFixed(0) + " ₽";
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

// Данные для круговой диаграммы доходов
const incomeDoughnutData = computed(() => ({
  labels: incomeByType.value.labels,
  datasets: [
    {
      data: incomeByType.value.data,
      backgroundColor: doughnutColors,
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 8,
    },
  ],
}));

// Данные для круговой диаграммы расходов
const expensesDoughnutData = computed(() => ({
  labels: expensesByType.value.labels,
  datasets: [
    {
      data: expensesByType.value.data,
      backgroundColor: doughnutColors,
      borderWidth: 2,
      borderColor: "#fff",
      hoverOffset: 8,
    },
  ],
}));

// Опции для круговой диаграммы
const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "60%",
  plugins: {
    legend: {
      position: "right" as const,
      labels: {
        usePointStyle: true,
        padding: 12,
        font: {
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function (context: any) {
          const label = context.label || "";
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0,
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value.toFixed(2)} ₽ (${percentage}%)`;
        },
      },
    },
  },
};

// Данные для графика баланса
const balanceBarData = computed(() => {
  const colors = stats.value.balance.map((b) =>
    b >= 0 ? COLORS.income : COLORS.expenses,
  );

  return {
    labels: stats.value.labels,
    datasets: [
      {
        label: "Баланс",
        data: stats.value.balance,
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
        hoverBackgroundColor: colors.map((c) => c + "CC"),
      },
    ],
  };
});

// Опции для графика баланса
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      padding: 12,
      cornerRadius: 6,
      callbacks: {
        label: function (context: any) {
          return "Баланс: " + context.parsed.y.toFixed(2) + " ₽";
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value: any) {
          return value.toFixed(0) + " ₽";
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
};

// Загрузка данных
async function loadData(): Promise<void> {
  isLoading.value = true;

  try {
    let periodStats;

    switch (period.value) {
      case "week":
        periodStats = await statisticsService.getDailyStats(7);
        break;
      case "month":
        periodStats = await statisticsService.getDailyStats(30);
        break;
      case "quarter":
        periodStats = await statisticsService.getMonthlyStats(3);
        break;
      case "year":
        periodStats = await statisticsService.getMonthlyStats(12);
        break;
      default:
        periodStats = await statisticsService.getDailyStats(30);
    }

    stats.value = periodStats;

    // Загружаем данные по категориям
    const [income, expenses] = await Promise.all([
      statisticsService.getIncomeByType(),
      statisticsService.getExpensesByType(),
    ]);

    incomeByType.value = income;
    expensesByType.value = expenses;
  } catch (error) {
    console.error("Failed to load statistics:", error);
  } finally {
    isLoading.value = false;
  }
}

// Загрузка при монтировании
onMounted(() => {
  loadData();
});

// Перезагрузка при смене периода
watch(period, () => {
  loadData();
});
</script>
<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.dashboard__header {
  margin-bottom: 8px;
}

.dashboard__title {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dashboard__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.dashboard__controls{
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.dashboard__mode-switch,
.dashboard__period-switch {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.dashboard__mode-btn,
.dashboard__period-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
  white-space: nowrap;
}

.dashboard__mode-btn:hover,
.dashboard__period-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dashboard__mode-btn--active,
.dashboard__period-btn--active {
  background: #4caf50;
  color: white;
  font-weight: 600;
}

.dashboard__card, .dashboard__card-balance {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--primary-color);
}

.dashboard__card-title, .dashboard__balance-title {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.dashboard__chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
  margin-bottom: 10px;
}

.dashboard__chart-wrapper--small {
  height: 300px;
}

.dashboard__loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 100%;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.dashboard__spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(76, 175, 80, 0.2);
  border-top: 3px solid #4caf50;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}



@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.dashboard__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.dashboard__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  margin: 0;
  color: var(--text-secondary);
  font-style: italic;
} 

/* Адаптивность */
@media (max-width: 1024px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .dashboard__mode-switch,
  .dashboard__period-switch {
    width: 100%;
    overflow-x: auto;
  }

  .dashboard__mode-btn,
  .dashboard__period-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .dashboard__chart-wrapper {
    height: 280px;
  }

  .dashboard__chart-wrapper--small {
    height: 250px;
  }

  .dashboard__card {
    padding: 16px;
  }
}
</style>
