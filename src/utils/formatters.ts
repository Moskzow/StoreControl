// Format a number as currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(amount);
}

// Format a date string
export function formatDate(dateString: string, includeTime: boolean = false): string {
  const date = new Date(dateString);
  
  if (includeTime) {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

// Format a number with comma as thousands separator
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('es-ES').format(number);
}

// Calculate VAT amount
export const VAT_RATE = 0.21; // 21% VAT rate in Spain

export function calculateVAT(amount: number): number {
  return amount * VAT_RATE;
}

// Calculate total with VAT
export function calculateTotalWithVAT(amount: number): number {
  return amount * (1 + VAT_RATE);
}

// Calculate net amount (without VAT)
export function calculateNetAmount(amountWithVAT: number): number {
  return amountWithVAT / (1 + VAT_RATE);
}