<template>
  <section class="report-generator" aria-label="Генератор отчётов">
    <header class="report-generator__header">
      <h2 class="report-generator__title">Финансовые отчёты</h2>
      <p class="report-generator__subtitle">
        Выберите период и скачайте отчёт в формате PDF
      </p>
    </header>

    <form class="report-generator__form" @submit.prevent="handleDownloadReport">
      <div class="report-generator__row">
        <div class="report-generator__field">
          <label for="reportTitle" class="report-generator__label">
            Название отчёта (необязательно)
          </label>
          <input
            id="reportTitle"
            v-model="reportForm.title"
            type="text"
            class="report-generator__input"
            placeholder="Например: Отчёт за январь 2026"
            :disabled="isGenerating"
          />
        </div>
      </div>

      <div class="report-generator__row">
        <div class="report-generator__field">
          <label for="startDate" class="report-generator__label">
            Начальная дата
          </label>
          <input
            id="startDate"
            v-model="reportForm.startDate"
            type="date"
            class="report-generator__input"
            :max="reportForm.endDate || today"
            :disabled="isGenerating"
            required
          />
        </div>
      </div>

      <div class="report-generator__field">
          <label for="endDate" class="report-generator__label">
            Конечная дата
          </label>
          <input
            id="endDate"
            v-model="reportForm.endDate"
            type="date"
            class="report-generator__input"
            :min="reportForm.startDate"
            :max="today"
            :disabled="isGenerating"
            required
          />
      </div>
      
      <div class="report-generator__actions">
        <button 
          type="submit" 
          class="report-generator__download-btn"
          :disabled="isGenerating"
        >
          <span v-if="!isGenerating" class="report-generator__btn-icon">
            📄
          </span>
          <span v-if="isGenerating" class="report-generator__spinner"></span>
          {{ isGenerating ? 'Формирование...' : 'Выгрузить отчет' }}
        </button>
        
        <button 
          type="button" 
          class="report-generator__quick-btn"
          @click="setCurrentMonth"
          :disabled="isGenerating"
          title="Установить текущий месяц"
        >
          Текущий месяц
        </button>
        
        <button 
          type="button" 
          class="report-generator__quick-btn"
          @click="setLastMonth"
          :disabled="isGenerating"
          title="Установить прошлый месяц"
        >
          Прошлый месяц
        </button>
      </div>
    </form>

    <div v-if="reports.length > 0" class="report-generator__history">
      <h3 class="report-generator__history-title">
        История отчетов
      </h3>
      
      <ul class="report-generator__list">
        <li 
          v-for="report in reports" 
          :key="report.id"
          class="report-generator__item"
        >
          <div class="report-generator__item-info">
            <h4 class="report-generator__item-title">{{ report.title }}</h4>
            <p class="report-generator__item-dates">
              {{ formatDate(report.startDate) }} - {{ formatDate(report.endDate) }}
            </p>
            <p class="report-generator__item-created">
              Создан: {{ formatDateTime(report.createdAt) }}
            </p>
          </div>
          
          <div class="report-generator__item-actions">
            <button 
              class="report-generator__item-btn report-generator__item-btn--download"
              @click="handleRedownload(report)"
              :disabled="isGenerating"
              title="Скачать отчет повторно"
            >
              Скачать
            </button>
            
            <button 
              class="report-generator__item-btn report-generator__item-btn--delete"
              @click="handleDeleteReport(report.id!)"
              :disabled="isGenerating"
              title="Удалить отчет"
            >
              Удалить
            </button>
          </div>
        </li>
      </ul>
    </div>
    
    <div v-else class="report-generator__empty">
      <p>У вас пока нет сохраненных отчетов</p>
    </div>

  </section>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, computed} from 'vue'
import { reportService } from '../services/report.service';
import type { Report } from '../services/database.service';

const isGenerating = ref(false)
const reports = ref<Report[]>([])

const today = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

const reportForm = reactive({
    title: '',
    startDate: '',
    endDate: ''
})

onMounted(async () => {
    await loadReports();
    setDefaultDates()
})

function setDefaultDates(): void {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)

    reportForm.startDate = firstDay.toISOString().split('T')[0]
    reportForm.endDate = now.toISOString().split('T')[0]
}

async function loadReports(): Promise<void> {
    try {
    reports.value = await reportService.getReports();
  } catch (error) {
    console.error('Failed to load reports:', error);
  }
}

async function handleDownloadReport(): Promise<void> {
    // Проверяем, не идет ли уже генерация
  if (isGenerating.value) {
    console.log('Generation already in progress');
    return;
  }
  
  if (!reportForm.startDate || !reportForm.endDate) {
    alert('Пожалуйста, выберите даты');
    return;
  }
  
  // Блокируем кнопку
  isGenerating.value = true;
  
  try {
    console.log('Starting report generation...');
    
    await reportService.downloadPDFReport(
      reportForm.startDate,
      reportForm.endDate,
      reportForm.title || undefined
    );
    
    console.log('Report generated successfully');
    
    // Обновляем список отчетов
    await loadReports();
    
    // Очищаем название
    reportForm.title = '';
    
    // Показываем уведомление
    showNotification('Отчет успешно сформирован и скачан');
    
  } catch (error) {
    console.error('Failed to generate report:', error);
    alert('Ошибка при формировании отчета: ' + (error as Error).message);
  } finally {
    // Разблокируем кнопку
    isGenerating.value = false;
    console.log('Generation completed');
  }
} 

function setCurrentMonth(): void {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  
  reportForm.startDate = firstDay.toISOString().split('T')[0];
  reportForm.endDate = now.toISOString().split('T')[0];
  reportForm.title = `Отчет за ${now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`;
  
  // Показываем уведомление
  showNotification('Даты установлены. Нажмите "Выгрузить отчет"');
}

function setLastMonth(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    
    reportForm.startDate = firstDay.toISOString().split('T')[0];
    reportForm.endDate = lastDay.toISOString().split('T')[0];
    reportForm.title = `Отчет за ${firstDay.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}`;
    
    // Показываем уведомление
    showNotification('Даты установлены. Нажмите "Выгрузить отчет"');
}

async function handleRedownload(report: Report): Promise<void> {
  if (isGenerating.value) return;
  
  isGenerating.value = true;
  
  try {
    await reportService.downloadPDFReport(
      report.startDate,
      report.endDate,
      report.title
    );
  } catch (error) {
    console.error('Failed to redownload report:', error);
    alert('Ошибка при скачивании отчета');
  } finally {
    isGenerating.value = false;
  }
}

async function handleDeleteReport(id: number): Promise<void> {
    if (confirm('Удалить этот отчет?')) {
        await reportService.deleteReport(id);
        await loadReports();
    }
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showNotification(message: string): void {
    // Простая реализация уведомления
    const notification = document.createElement('div');
    notification.className = 'report-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('report-notification--show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('report-notification--show');
        setTimeout(() => {
        document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
</script>

<style scoped>
.report-generator {
    padding: 24px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--primary-color);
    width: 100%;
    }

    .report-generator__header {
    margin-bottom: 24px;
    }

    .report-generator__title {
    margin: 0 0 8px 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    }

    .report-generator__subtitle {
    margin: 0;
    font-size: 0.95rem;
    color: var(--text-secondary);
    }

    .report-generator__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 32px;
    }

    .report-generator__row {
    display: flex;
    gap: 16px;
    }

    .report-generator__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    }

    .report-generator__label {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--text-secondary);
    }

    .report-generator__input {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.95rem;
    transition: border-color 0.3s;
    }

    .report-generator__input:focus {
    outline: none;
    border-color: #4caf50;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
    }

    .report-generator__actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
    }

    .report-generator__download-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: #4caf50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    transition: all 0.3s;
    }

    .report-generator__download-btn:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .report-generator__download-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    }

    .report-generator__btn-icon {
    font-size: 1.2rem;
    }

    .report-generator__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
    to { transform: rotate(360deg); }
    }

    .report-generator__quick-btn {
    padding: 10px 16px;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: all 0.3s;
    }

    .report-generator__quick-btn:hover {
    background: var(--bg-primary);
    border-color: #4caf50;
    }

    .report-generator__history {
    border-top: 1px solid var(--border-color);
    padding-top: 24px;
    }

    .report-generator__history-title {
    margin: 0 0 16px 0;
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    }

    .report-generator__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    }

    .report-generator__item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    transition: all 0.3s;
    }

    .report-generator__item:hover {
    border-color: #4caf50;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .report-generator__item-info {
    flex: 1;
    }

    .report-generator__item-title {
    margin: 0 0 4px 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    }

    .report-generator__item-dates {
    margin: 0 0 2px 0;
    font-size: 0.9rem;
    color: var(--text-secondary);
    }

    .report-generator__item-created {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-secondary);
    opacity: 0.8;
    }

    .report-generator__item-actions {
    display: flex;
    gap: 8px;
    }

    .report-generator__item-btn {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    cursor: pointer;
    background: transparent;
    color: var(--text-primary);
    font-size: 0.85rem;
    transition: all 0.3s;
    }

    .report-generator__item-btn--download:hover {
    background: #2196f3;
    color: white;
    border-color: #2196f3;
    }

    .report-generator__item-btn--delete:hover {
    background: #f44336;
    color: white;
    border-color: #f44336;
    }

    .report-generator__empty {
    text-align: center;
    padding: 32px;
    color: var(--text-secondary);
}

@media (max-width: 768px) {
    .report-generator__row {
        flex-direction: column;
    }
    
    .report-generator__actions {
        flex-direction: column;
    }
    
    .report-generator__download-btn,
    .report-generator__quick-btn {
        width: 100%;
        justify-content: center;
    }
    
    .report-generator__item {
        flex-direction: column;
        gap: 12px;
    }
    
    .report-generator__item-actions {
        width: 100%;
    }
    
    .report-generator__item-btn {
        flex: 1;
    }
}
</style>
