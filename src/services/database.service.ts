import { openDB, type IDBPDatabase } from "idb";
import type { Transaction, Report } from '../types/transaction'

export type { Transaction, Report } from '../types/transaction'

class DatabaseService {
  private db: IDBPDatabase | null = null;
  private readonly DB_NAME = "finance-app";
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("transactions")) {
          const txStore = db.createObjectStore("transactions", {
            keyPath: "id",
            autoIncrement: true,
          });

          txStore.createIndex("by-date", "date");
          txStore.createIndex("by-category", "category");
          txStore.createIndex("by-created", "createdAt");
        }

        if (!db.objectStoreNames.contains("reports")) {
          const reportStore = db.createObjectStore("reports", {
            keyPath: "id",
            autoIncrement: true,
          });

          reportStore.createIndex("by-created", "createdAt");
          reportStore.createIndex("by-date-range", ["startDate", "endDate"]);
        }
      },
    });
  }

  getDB(): IDBPDatabase {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first");
    }
    return this.db;
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const db = this.getDB();
    return (await db.getAll("transactions")) as Transaction[];
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const db = this.getDB();
    return (await db.get("transactions", id)) as Transaction | undefined;
  }

  async addTransaction(transaction: Transaction): Promise<number> {
    const db = this.getDB();
    return (await db.add("transactions", transaction)) as number;
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const db = this.getDB();
    await db.put("transactions", transaction);
  }

  async deleteTransaction(id: number): Promise<void> {
    const db = this.getDB();
    await db.delete("transactions", id);
  }

  async clearTransactions(): Promise<void> {
    const db = this.getDB();
    await db.clear("transactions");
  }

  async getAllReports(): Promise<Report[]> {
    const db = this.getDB();
    return (await db.getAll("reports")) as Report[];
  }

  async getReport(id: number): Promise<Report | undefined> {
    const db = this.getDB();
    return (await db.get("reports", id)) as Report | undefined;
  }

  async addReport(report: Report): Promise<number> {
    const db = this.getDB();
    return (await db.add("reports", report)) as number;
  }

  async deleteReport(id: number): Promise<void> {
    const db = this.getDB();
    await db.delete("reports", id);
  }
}

export const databaseService = new DatabaseService()
