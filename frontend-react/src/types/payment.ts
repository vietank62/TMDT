export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'credit_card' | 'bank_transfer' | 'sepay' | 'vnpay';
export type SortOrder = 'newest' | 'oldest';

export interface PaymentItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface PaymentTransaction {
  id: string;
  date: string; // ISO 8601
  description: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  invoiceUrl?: string;
  billingName: string;
  billingEmail: string;
  providerReference: string;
  items: PaymentItem[];
  notes?: string;
  refundReason?: string;
}

export interface PaymentFiltersState {
  search: string;
  status: PaymentStatus | 'all';
  dateFrom: string;
  dateTo: string;
  sortOrder: SortOrder;
}
