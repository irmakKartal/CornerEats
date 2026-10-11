export const isValidPaymentSession = (order, session, userId) => {
  const orderId = String(order?._id ?? '');
  const authenticatedUserId = String(userId ?? '');

  return Boolean(
    orderId &&
    authenticatedUserId &&
    session?.payment_status === 'paid' &&
    String(order.userId) === authenticatedUserId &&
    String(session.client_reference_id) === orderId &&
    session.metadata?.orderId === orderId &&
    session.metadata?.userId === authenticatedUserId &&
    session.currency === String(order.currency).toLowerCase() &&
    Number.isInteger(session.amount_total) &&
    session.amount_total === Number(order.amountInMinorUnits)
  );
};