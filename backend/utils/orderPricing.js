import { getRate } from '../services/currencyService.js';

const DELIVERY_FEE = 5;

const calculateOrderTotals = (
  items,
  currency = 'USD',
  expectedAmount,
  discountPercent = 0,
  customRate
) => {
  const safeCurrency = currency ? String(currency).trim().toUpperCase() : 'USD';
  const multipliedBy = Number.isFinite(customRate) && customRate > 0
    ? customRate
    : getRate(safeCurrency);
  const discountRate = Number(discountPercent);

  if (!Number.isFinite(discountRate) || discountRate < 0 || discountRate > 100) {
    throw new Error('Invalid discount percentage');
  }

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item?.quantity);
    const unitPrice = Number(item?.price);
    return sum + (Number.isFinite(quantity) && quantity > 0 && Number.isFinite(unitPrice) ? unitPrice * quantity : 0);
  }, 0);

  const subtotalInCurrency = subtotal * multipliedBy;
  const discountAmount = subtotalInCurrency * (discountRate / 100);
  const deliveryFee = DELIVERY_FEE * multipliedBy;
  const total = subtotalInCurrency - discountAmount + deliveryFee;
  const roundedTotal = Math.round((total + Number.EPSILON) * 100) / 100;

  if (expectedAmount !== undefined && Math.abs(roundedTotal - Number(expectedAmount)) > 0.05) {
    throw new Error('Payment amount does not match the server calculation');
  }

  return {
    subtotal: subtotalInCurrency,
    discountAmount: Math.round((discountAmount + Number.EPSILON) * 100) / 100,
    deliveryFee,
    total: roundedTotal,
    rate: multipliedBy,
    currency: safeCurrency,
    lineItems: items.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unit_amount: Math.round(Number(item.price) * multipliedBy * 100),
    })),
  };
};

export { calculateOrderTotals };
