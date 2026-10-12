export interface Transaction {
  id?: number;
  category: "income" | "expense";
  amount: number;
  type: string;
  date: string;
  description: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>

export interface Report {
  id?: number;
  title: string;
  startDate: string;
  endDate: string;
  format: "json" | "csv" | "pdf";
  data: string;
  createdAt: string;
}
