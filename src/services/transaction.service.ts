import { databaseService } from "../services/database.service";
import type { Transaction } from '../services/database.service'

class TransactionService {

    async getTransactions(filter?: string, sortBy?: keyof Transaction, sortOrder?: 'asc' | 'desc') : Promise<Transaction[]> {
        let transactions = await databaseService.getAllTransactions()

        if (filter && filter !== 'all'){
            transactions = transactions.filter(t => t.category === filter)
        }

        if (sortBy) {
            transactions.sort((a, b) => {
                const aValue = a[sortBy];
                const bValue = b[sortBy];

                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortOrder === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
                }

                if (sortOrder === 'desc'){
                    return (bValue as number) - (aValue as number);
                }
                return (aValue as number) - (bValue as number)
            });
        } else {
            transactions.sort((a, b) => b.date.localeCompare(a.date))
        }

        return transactions;
    }

    async getTransactionsByDateRange(startDate: string, endDate: string): Promise<Transaction[]>{
        const allTransactions = await databaseService.getAllTransactions()

        return allTransactions.filter(t => t.date >= startDate && t.date <= endDate)
    }

    async addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction>{
        const now = new Date().toISOString();

        const full: Omit<Transaction, 'id'> = {
            ...transaction,
            tags: transaction.tags || [],
            createdAt: now,
            updatedAt: now
        };

        const id = await databaseService.addTransaction(full);

        return {...full, id}
    }

    async updateTransaction(id: number, updates: Partial<Transaction>): Promise<void>{
        const transaction = await databaseService.getTransaction(id);

        if (!transaction){
            throw new Error ("Transaction not found")
        }

        const updatedTransaction = {
            ...transaction,
            ...updates,
            id,
            updatedAt: new Date().toISOString()
        }

        await databaseService.updateTransaction(updatedTransaction);
    }

    async deleteTransaction(id: number): Promise<void>{
        await databaseService.deleteTransaction(id)
    }

    async deleteAllTransactions(): Promise<void>{
        await databaseService.clearTransactions()
    }

    async getStatistics(startDate?: string, endDate?: string): Promise<{
        balance: number,
        income: number,
        expenses: number,
        byCategory: Record<string, number>;
        byMonth: Record<string, {income: number; expenses: number}>;
        byType: Record<string, {count: number, total: number}>
    }> {
        let transactions: Transaction[];

        if (startDate && endDate) {
            transactions = await this.getTransactionsByDateRange(startDate, endDate)
        } else {
            transactions = await this.getTransactions()
        }

        const stats = {
            balance: 0,
            income: 0,
            expenses: 0,
            byCategory: {} as Record<string, number>,
            byMonth: {} as Record<string, {income: number; expenses: number}>,
            byType: {} as Record<string, {count: number, total: number}>
        }

        for (const transaction of transactions) {
            if (transaction.category === 'income') {
                stats.income += transaction.amount;
                stats.balance += transaction.amount
            } else {
                stats.expenses += transaction.amount;
                stats.balance -= transaction.amount
            }

            if (!stats.byCategory[transaction.category]){
                stats.byCategory[transaction.category] = 0
            }
            stats.byCategory[transaction.category] += transaction.amount

            const type = transaction.type || 'other';
            if (!stats.byType[type]) {
                stats.byType[type] = {count: 0, total: 0};
            }
            stats.byType[type].count++;
            stats.byType[type].total += transaction.amount;

            const month = transaction.date.substring(0, 7);
            if (!stats.byMonth[month]){
                stats.byMonth[month] = {income: 0, expenses: 0}
            }
            if (transaction.category === 'income'){
                stats.byMonth[month].income += transaction.amount
            } else {
                stats.byMonth[month].expenses += transaction.amount
            }
        }

        return stats
    }


    async searchTransactions(searchTerm: string): Promise<Transaction[]> {
        const transactions = await this.getTransactions();
        const term = searchTerm.toLowerCase();

        return transactions.filter(t => t.type.toLowerCase().includes(term) || (t.description && t.description.toLowerCase().includes(term)) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(term))));
    }
}

export const transactionService = new TransactionService()