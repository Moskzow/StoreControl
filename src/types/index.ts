// Product types
export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  purchasePrice: number;
  salePrice: number;
  hasDiscount: boolean;
  discountPrice: number;
  hasVAT: boolean;
  stock: number;
  supplierId: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  suppliers?: string[]; // Array of supplier IDs that offer this product
  prices?: {
    [supplierId: string]: number; // Map of supplier IDs to their prices
  };
  profitMargins: {
    habitual: number;
    vip: number;
    premium: number;
    wholesale: number;
  };
  lowStockThreshold?: number; // Individual low stock threshold for this product
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  createdAt: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  taxId?: string; // NIF/CIF for business customers
  customerType: 'individual' | 'business';
  customerTypeId?: string; // Reference to CustomerType
  preferredPaymentMethod?: PaymentMethod;
  creditLimit?: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
  totalPurchases: number;
  lastPurchaseDate?: string;
  isActive: boolean;
}

export interface CustomerType {
  id: string;
  name: string;
  profitMargin: number;
  description?: string;
  minPurchaseAmount?: number; // Minimum purchase amount to qualify for this type
  benefits?: string[]; // List of benefits for this customer type
  color?: string; // Color for UI representation
}

// Cart types
export interface CartItem {
  productId: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  hasVAT: boolean;
}

// Payment methods
export type PaymentMethod = 'cash' | 'card' | 'bizum' | 'installments' | 'monthly';

// Sale types
export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  customerType: CustomerType;
  customerId?: string; // Optional link to customer record
  paymentMethod: PaymentMethod;
  cashRegisterId: string;
  notes: string;
}

// Purchase types
export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  items: PurchaseItem[];
  total: number;
  notes: string;
  status: PurchaseStatus;
  paymentStatus: PaymentStatus;
  invoiceNumber?: string;
}

export interface PurchaseItem {
  productId: string;
  code: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export type PurchaseStatus = 'pending' | 'received' | 'cancelled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

// Cash register types
export interface CashRegister {
  id: string;
  openedAt: string;
  initialAmount: number;
  closedAt: string | null;
  finalAmount: number | null;
}

// Report types
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface SalesReport {
  totalSales: number;
  salesCount: number;
  averageSale: number;
  salesByPaymentMethod: Record<PaymentMethod, number>;
  salesByCustomerType: Record<string, number>;
}

export interface ProductReport {
  mostSold: Array<{productId: string, name: string, quantity: number}>;
  leastSold: Array<{productId: string, name: string, quantity: number}>;
}

export interface StockReport {
  lowStock: Product[];
  totalProducts: number;
  totalValue: number;
}

// Company info for tickets and footer
export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  website?: string;
  description?: string;
  logo?: string;
}