export interface DashboardStats {
  totalCustomers: number;
  totalInvoices: number;
  pendingAmount: number;
  collectedAmount: number;
  overdueCount: number;
  remindersSentThisMonth: number;
  monthlyRevenue: Array<{ month: string; tahsilat: number; alacak: number }>;
  invoiceStatusData: Array<{ name: string; value: number; color: string }>;
  collectionRateData: Array<{ month: string; rate: number }>;
  topCustomers: Array<{ name: string; total: number; paid: number }>;
}
