import Decimal from 'decimal.js';

export function formatCurrency(value: number | string | Decimal) {
  const amount = typeof value === 'object' && value instanceof Decimal 
    ? value.toNumber() 
    : typeof value === 'string' 
      ? parseFloat(value) 
      : value;
      
  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}
