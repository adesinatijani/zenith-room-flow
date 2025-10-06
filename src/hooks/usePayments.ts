import { useQuery } from "@tanstack/react-query";
import { getAllPayments } from "@/utils/accountingIntegration";

export interface Payment {
  id: string;
  transactionId: string;
  guestName: string;
  amount: number;
  method: 'card' | 'cash' | 'bank' | 'paystack' | 'flutterwave';
  type: 'booking' | 'pos' | 'service' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'active' | 'cancelled';
  date: string;
  description: string;
  roomNumber?: string;
  reference: string;
}

/**
 * Hook to get all payments from room bookings, hall bookings, and POS orders
 */
export const usePayments = () => {
  return useQuery({
    queryKey: ['all-payments'],
    queryFn: getAllPayments,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * Hook to get payment summary statistics
 */
export const usePaymentSummary = () => {
  return useQuery({
    queryKey: ['payment-summary'],
    queryFn: async () => {
      const payments = await getAllPayments();
      
      const completed = payments.filter(p => p.status === 'completed');
      const today = payments.filter(p => {
        const paymentDate = new Date(p.date).toDateString();
        const todayDate = new Date().toDateString();
        return paymentDate === todayDate;
      });
      
      return {
        totalRevenue: completed.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0),
        todayRevenue: today.reduce((sum, p) => sum + (p.amount > 0 ? p.amount : 0), 0),
        pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
        refundedAmount: Math.abs(payments.filter(p => p.type === 'refund').reduce((sum, p) => sum + p.amount, 0)),
        transactionCount: payments.length,
        avgTransactionValue: completed.length > 0 ? completed.reduce((sum, p) => sum + Math.abs(p.amount), 0) / completed.length : 0,
      };
    },
    refetchInterval: 30000,
  });
};
