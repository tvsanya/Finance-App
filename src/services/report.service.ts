import { databaseService } from './database.service';
import { transactionService } from './transaction.service';
import type { Report, Transaction } from './database.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

class ReportService {
  private isGenerating = false;
  private fontsLoaded = false;
  private regularFontBase64: string | null = null;
  private boldFontBase64: string | null = null;
  
  /**
   * Загружает шрифты с поддержкой кириллицы
   */
  private async loadFonts(): Promise<void> {
    if (this.fontsLoaded) return;
    
    console.log('Loading fonts...');
    
    try {
      // Загружаем обычный шрифт
      const regularResponse = await fetch('/fonts/Roboto-Regular.ttf');
      if (!regularResponse.ok) {
        throw new Error(`Failed to load regular font: ${regularResponse.status}`);
      }
      const regularBuffer = await regularResponse.arrayBuffer();
      this.regularFontBase64 = this.arrayBufferToBase64(regularBuffer);
      console.log('Regular font loaded, base64 length:', this.regularFontBase64.length);
      
      // Загружаем жирный шрифт (если нужен)
      try {
        const boldResponse = await fetch('/fonts/Roboto-Bold.ttf');
        if (boldResponse.ok) {
          const boldBuffer = await boldResponse.arrayBuffer();
          this.boldFontBase64 = this.arrayBufferToBase64(boldBuffer);
          console.log('Bold font loaded, base64 length:', this.boldFontBase64.length);
        }
      } catch (e) {
        console.warn('Bold font not loaded, using regular for bold');
      }
      
      this.fontsLoaded = true;
      console.log('Fonts loaded successfully');
      
    } catch (error) {
      console.error('Failed to load fonts:', error);
      throw new Error('Не удалось загрузить шрифты для PDF. Проверьте наличие файлов в public/fonts/');
    }
  }
  
  /**
   * Конвертирует ArrayBuffer в base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000; // Обрабатываем по 32KB для избежания stack overflow
    
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binary);
  }
  
  /**
   * Регистрирует шрифты в PDF документе
   */
  private registerFonts(doc: jsPDF): void {
    if (!this.regularFontBase64) {
      throw new Error('Fonts not loaded. Call loadFonts() first.');
    }
    
    // Регистрируем обычный шрифт
    doc.addFileToVFS('Roboto-Regular.ttf', this.regularFontBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    
    // Регистрируем жирный шрифт или используем обычный
    if (this.boldFontBase64) {
      doc.addFileToVFS('Roboto-Bold.ttf', this.boldFontBase64);
      doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
    } else {
      // Если нет жирного, регистрируем обычный как bold
      doc.addFont('Roboto-Regular.ttf', 'Roboto', 'bold');
    }
    
    // Устанавливаем шрифт по умолчанию
    doc.setFont('Roboto', 'normal');
  }
  
  async generatePDFReport(
    startDate: string,
    endDate: string,
    title?: string
  ): Promise<Blob> {
    console.log('=== Starting PDF generation ===');
    
    if (this.isGenerating) {
      throw new Error('Report generation already in progress');
    }
    
    this.isGenerating = true;
    
    try {
      // 1. Загружаем шрифты
      await this.loadFonts();
      
      // 2. Получаем данные
      console.log('Loading transactions...');
      const transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);
      console.log('Transactions loaded:', transactions.length);
      
      console.log('Loading statistics...');
      const stats = await transactionService.getStatistics(startDate, endDate);
      console.log('Statistics loaded:', stats);
      
      // 3. Создаем PDF
      console.log('Creating PDF document...');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // 4. Регистрируем шрифты
      this.registerFonts(doc);
      
      // 5. Добавляем содержимое
      this.addHeader(doc, title, startDate, endDate);
      this.addStatistics(doc, stats, transactions);
      this.addCategories(doc, stats);
      this.addTransactions(doc, transactions);
      this.addFooter(doc);
      
      // 6. Возвращаем blob
      console.log('Generating blob...');
      const blob = doc.output('blob');
      console.log('Blob generated, size:', blob.size);
      
      return blob;
      
    } finally {
      this.isGenerating = false;
    }
  }
  
  /**
   * Добавляет заголовок отчета
   */
  private addHeader(
    doc: jsPDF,
    title: string | undefined,
    startDate: string,
    endDate: string
  ): void {
    // Заголовок
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(20);
    doc.text(
      title || 'Финансовый отчет',
      105,
      20,
      { align: 'center' }
    );
    
    // Период
    doc.setFont('Roboto', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Период: ${this.formatDateRange(startDate, endDate)}`,
      105,
      30,
      { align: 'center' }
    );
    
    // Дата формирования
    doc.setFontSize(10);
    doc.text(
      `Сформирован: ${this.formatDateTime(new Date())}`,
      105,
      37,
      { align: 'center' }
    );
    
    // Сброс цвета
    doc.setTextColor(0, 0, 0);
  }
  
  /**
   * Добавляет сводную статистику
   */
  private addStatistics(
    doc: jsPDF,
    stats: any,
    transactions: Transaction[]
  ): void {
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.text('Сводная статистика', 14, 50);
    
    autoTable(doc, {
      startY: 55,
      head: [['Показатель', 'Значение']],
      body: [
        ['Доходы', `${stats.income.toFixed(2)} ₽`],
        ['Расходы', `${stats.expenses.toFixed(2)} ₽`],
        ['Баланс', `${stats.balance.toFixed(2)} ₽`],
        ['Всего транзакций', transactions.length.toString()],
        ['Доходных операций', transactions.filter(t => t.category === 'income').length.toString()],
        ['Расходных операций', transactions.filter(t => t.category === 'expense').length.toString()],
      ],
      theme: 'striped',
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 4
      },
      headStyles: {
        font: 'Roboto',
        fontStyle: 'bold',
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { fontStyle: 'bold' }
      }
    });
  }
  
  /**
   * Добавляет статистику по категориям
   */
  private addCategories(doc: jsPDF, stats: any): void {
    const currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Проверяем, хватит ли места
    if (currentY > 250) {
      doc.addPage();
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(14);
      doc.text('По категориям', 14, 20);
      
      autoTable(doc, {
        startY: 25,
        head: [['Категория', 'Сумма']],
        body: Object.entries(stats.byCategory).map(([category, amount]) => [
          this.getCategoryLabel(category),
          `${(amount as number).toFixed(2)} ₽`
        ]),
        theme: 'grid',
        styles: {
          font: 'Roboto',
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          font: 'Roboto',
          fontStyle: 'bold',
          fillColor: [33, 150, 243],
          textColor: [255, 255, 255]
        }
      });
    } else {
      doc.setFont('Roboto', 'bold');
      doc.setFontSize(14);
      doc.text('По категориям', 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Категория', 'Сумма']],
        body: Object.entries(stats.byCategory).map(([category, amount]) => [
          this.getCategoryLabel(category),
          `${(amount as number).toFixed(2)} ₽`
        ]),
        theme: 'grid',
        styles: {
          font: 'Roboto',
          fontSize: 10,
          cellPadding: 4
        },
        headStyles: {
          font: 'Roboto',
          fontStyle: 'bold',
          fillColor: [33, 150, 243],
          textColor: [255, 255, 255]
        }
      });
    }
  }
  
  /**
   * Добавляет таблицу транзакций
   */
  private addTransactions(doc: jsPDF, transactions: Transaction[]): void {
    if (transactions.length === 0) return;
    
    
    // Новая страница для транзакций
    doc.addPage();
    doc.setFont('Roboto', 'bold');
    doc.setFontSize(14);
    doc.text('Транзакции', 14, 20);
    
    // Подготавливаем данные
    const tableBody = transactions.map(t => [
      this.formatDate(t.date),
      t.type,
      t.category === 'income' ? 'Доход' : 'Расход',
      `${t.category === 'income' ? '+' : '-'}${t.amount.toFixed(2)} ₽`,
      t.description || ''
    ]);
    
    autoTable(doc, {
      startY: 25,
      head: [['Дата', 'Название', 'Тип', 'Сумма', 'Описание']],
      body: tableBody,
      theme: 'striped',
      styles: {
        font: 'Roboto',
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      headStyles: {
        font: 'Roboto',
        fontStyle: 'bold',
        fillColor: [76, 175, 80],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 40 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30, halign: 'right' },
        4: { cellWidth: 'auto' }
      },
      didParseCell: (data) => {
        // Окрашиваем суммы
        if (data.section === 'body' && data.column.index === 3) {
          const rowData = data.row.raw as string[];
          const type = rowData[2];
          if (type === 'Доход') {
            data.cell.styles.textColor = [76, 175, 80];
          } else {
            data.cell.styles.textColor = [244, 67, 54];
          }
        }
      }
    });
  }
  
  /**
   * Добавляет подвал
   */
  private addFooter(doc: jsPDF): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      
      const pageHeight = doc.internal.pageSize.getHeight();
      
      doc.text(
        `Страница ${i} из ${pageCount}`,
        105,
        pageHeight - 10,
        { align: 'center' }
      );
      
      doc.text(
        'Finance App © 2024',
        14,
        pageHeight - 10
      );
    }
    
    doc.setTextColor(0, 0, 0);
  }
  
  async downloadPDFReport(startDate: string, endDate: string, title?: string): Promise<void> {
    console.log('downloadPDFReport called');
    
    try {
      const blob = await this.generatePDFReport(startDate, endDate, title);
      
      const filename = `finance-report-${startDate}-to-${endDate}.pdf`;
      this.downloadBlob(blob, filename);
      
      await this.saveReportToDatabase(startDate, endDate, title);
      
      console.log('Report downloaded and saved');
    } catch (error) {
      console.error('Error in downloadPDFReport:', error);
      throw error;
    }
  }
  
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Освобождаем URL через небольшую задержку
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
  
  private async saveReportToDatabase(startDate: string, endDate: string, title?: string): Promise<void> {
    const report: Report = {
      title: title || `Отчет ${this.formatDateRange(startDate, endDate)}`,
      startDate,
      endDate,
      format: 'pdf',
      data: 'PDF Report',
      createdAt: new Date().toISOString()
    };
    
    await databaseService.addReport(report);
  }
  
  async getReports(): Promise<Report[]> {
    const reports = await databaseService.getAllReports();
    return reports.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  
  async deleteReport(id: number): Promise<void> {
    await databaseService.deleteReport(id);
  }
  
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
  
  private formatDateTime(date: Date): string {
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  private formatDateRange(startDate: string, endDate: string): string {
    return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
  }
  
  private getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      'income': 'Доходы',
      'expense': 'Расходы'
    };
    return labels[category] || category;
  }
}

export const reportService = new ReportService();