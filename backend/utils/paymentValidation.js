export const isValidPaymentSession = (order, session, userId) => {
  const orderId = String(order?._id ?? '');
  const authenticatedUserId = String(userId ?? '');

  if (!orderId || !authenticatedUserId) return false;
  if (String(order.userId) !== authenticatedUserId) return false;

  // Verify association with this order via client_reference_id or metadata
  const matchesRef = String(session?.client_reference_id || '') === orderId;
  const matchesMeta = String(session?.metadata?.orderId || '') === orderId;
  if (!matchesRef && !matchesMeta) return false;

  // Verify user ownership if present in metadata
  if (session?.metadata?.userId && String(session.metadata.userId) !== authenticatedUserId) {
    return false;
  }

  // Payment status check: accept 'paid', 'complete', or succeeded payment_intent
  const isPaid =
    session?.payment_status === 'paid' ||
    session?.status === 'complete' ||
    session?.payment_intent?.status === 'succeeded';
  if (!isPaid) return false;

  // Currency check
  const orderCurrency = String(order.currency || '').toLowerCase();
  const sessionCurrency = String(session?.currency || '').toLowerCase();
  if (sessionCurrency && orderCurrency && sessionCurrency !== orderCurrency) {
    return false;
  }

  // Amount check with 10 minor-unit tolerance for rounding differences
  if (typeof session?.amount_total === 'number') {
    const expectedAmount = Number(order.amountInMinorUnits);
    if (Math.abs(session.amount_total - expectedAmount) > 10) {
      return false;
    }
  }

  return true;
};