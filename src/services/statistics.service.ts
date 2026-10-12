import { transactionService } from "./transaction.service";

export interface ChartData {
    labels: string[]
    datasets: {
        label: string
        data: number[]
        backgroundColor?: string | string[]
        borderColor?: number
        tension?: number
        fill?: boolean
    }[]
}

export interface StatisticsByPeriod {
    labels: string[]
    income: number[]
    expenses: number[]
    balance: number[]
}

class StatisticsService {
    /**
    * Получает статистику по месяцам за указанный период
    */
    
    async getMonthlyStats(months: number = 6): Promise<StatisticsByPeriod>{
        const transactions = await transactionService.getTransactions()
        const now = new Date()

        const labels: string[] = []
        const income: number[] = []
        const expenses: number[] = []
        const balance: number[] = []

        let runningBalance = 0

        // Проходим по месяцам от самого старого к новому
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            const monthLabel = date.toLocaleDateString('ru-RU', {month: 'short', year: '2-digit'})
            labels.push(monthLabel)

            const monthTransactions = transactions.filter(t => t.date.startsWith(monthKey))
            const monthIncome = monthTransactions.filter(t => t.category === 'income').reduce((acc, t) => acc + t.amount, 0)
            const monthExpenses = monthTransactions.filter(t => t.category === 'expense').reduce((acc, t) => acc + t.amount, 0)

            runningBalance += monthIncome - monthExpenses;

            income.push(monthIncome)
            expenses.push(monthExpenses)
            balance.push(runningBalance)
        }

        return {labels, income, expenses, balance}
    }

    //Получает статистику по дням за указанный период
    async getDailyStats(days: number = 30): Promise<StatisticsByPeriod> {
        const transactions = await transactionService.getTransactions()
        const now = new Date()

        const labels: string[] = []
        const income: number[] = []
        const expenses: number[] = []
        const balance: number[] = []

        let runningBalance = 0

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)
            const dateKey = date.toISOString().split('T')[0]
            const dateLabel = date.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})
            labels.push(dateLabel)

            const dayTransactions = transactions.filter(t => t.date === dateKey)

            const dayIncome = dayTransactions.filter(t => t.category === 'income').reduce((acc, t) => acc + t.amount, 0)
            const dayExpenses = dayTransactions.filter(t => t.category === 'expense').reduce((acc, t) => acc + t.amount, 0)

            runningBalance += dayIncome - dayExpenses

            income.push(dayIncome)
            expenses.push(dayExpenses)
            balance.push(runningBalance)
        }
        return {labels, income, expenses, balance}
    }

    // Получает статистику по категориям расходов
    async getExpensesByType(): Promise<{labels: string[]; data: number[]}> {
        const transactions = await transactionService.getTransactions()

        const expenses = transactions.filter(t => t.category === 'expense')
        const byType: Record<string, number> = {}
        for (const t of expenses) {
            const type = t.type || 'Другое'
            byType[type] = (byType[type] || 0) + t.amount
        }

        const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1])
        
        return {
            labels: sorted.map(([label]) => label),
            data: sorted.map(([, amount]) => amount)
        }
    }

    // Получает статистику по категориям доходов
    async getIncomeByType(): Promise<{ labels: string[]; data: number[] }> {
        const transactions = await transactionService.getTransactions()

        const income = transactions.filter(t => t.category === 'income')

        const byType: Record<string, number> = {}
        for (const t of income) {
            const type = t.type || 'Другое'
            byType[type] = (byType[type] || 0) + t.amount
        }

        const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1])

        return {
            labels: sorted.map(([label]) => label),
            data: sorted.map(([, amount]) => amount)
        }
    }

    //Получает статистику по неделям
    async getWeeklyStats(weeks: number = 8): Promise<StatisticsByPeriod> {
        const transactions = await transactionService.getTransactions()
        const now = new Date()

        const labels: string[] = []
        const income: number[] = []
        const expenses: number[] = []
        const balance: number[] = []

        let runningBalance = 0

        for (let i = weeks - 1; i >= 0; i--) {
            const weekStart = new Date(now)
            weekStart.setDate(weekStart.getDate() - (i * 7) - now.getDay() + 1)
            const weekEnd = new Date(weekStart)
            weekEnd.setDate(weekEnd.getDate() + 6)

            const weekStartKey = weekStart.toISOString().split('T')[0]
            const weekEndKey = weekEnd.toISOString().split('T')[0]

            const label = `${weekStart.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})} - ${weekEnd.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})}`
            labels.push(label)

            const weekTransactions = transactions.filter(t => t.date >= weekStartKey && t.date <= weekEndKey)

            const weekIncome = weekTransactions.filter(t => t.category === 'income').reduce((acc, t) => acc + t.amount, 0)
            const weekExpenses = weekTransactions.filter(t => t.category === 'expense').reduce((acc, t) => acc + t.amount, 0)

            runningBalance += weekIncome - weekExpenses

            income.push(weekIncome)
            expenses.push(weekExpenses)
            balance.push(runningBalance)
        }
        return {labels, income, expenses, balance}
    } 
}

export const statisticsService = new StatisticsService()