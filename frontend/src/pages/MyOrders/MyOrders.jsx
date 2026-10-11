import { useCallback, useContext, useEffect, useState } from 'react';
import './MyOrders.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { formatPrice, formatDate, getExchangeRate } from '../../utils/currency';

const MyOrders = () => {
  const [data, setData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reordering, setReordering] = useState(false);
  const { url, token, addMultipleToCart, currencyConfig } = useContext(StoreContext);
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    const activeToken = token || localStorage.getItem("token");
    if (!activeToken) return;

    try {
      const response = await axios.post(
        url + "/api/order/userorders",
        {},
        { headers: { token: activeToken } }
      );
      const orders = Array.isArray(response.data?.data) ? response.data.data : [];
      // Only keep orders where payment has been successfully confirmed
      const paidOrders = orders.filter((order) => order.payment === true);
      const sorted = [...paidOrders].sort((a, b) => {
        const timeA = new Date(a.date || 0).getTime();
        const timeB = new Date(b.date || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return String(b._id).localeCompare(String(a._id));
      });
      setData(sorted);
    } catch (error) {
      console.error("Unable to load orders:", error);
    }
  }, [token, url]);

  useEffect(() => {
    const activeToken = token || localStorage.getItem("token");
    if (activeToken) {
      fetchOrders();
    }
  }, [fetchOrders, token]);

  const handleReorder = async (order) => {
    if (!order?.items?.length) return;
    setReordering(true);
    try {
      if (addMultipleToCart) {
        await addMultipleToCart(order.items);
      }
      toast.success("Reorder success");
      setSelectedOrder(null);
      navigate('/cart');
    } catch (error) {
      console.error("Reorder failed:", error);
      toast.error("Reorder failed");
    } finally {
      setReordering(false);
    }
  };

  const modalSubtotalUSD = selectedOrder?.items?.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  ) || 0;

  const orderDiscountPercent = Number(selectedOrder?.discountPercent || 0);
  const orderCurrencyRate = getExchangeRate(selectedOrder?.currency);
  const normalizedOrderTotal = orderCurrencyRate > 0
    ? Number(selectedOrder?.amount || 0) / orderCurrencyRate
    : Number(selectedOrder?.amount || 0);

  const modalDiscountBase = orderDiscountPercent > 0
    ? modalSubtotalUSD * (orderDiscountPercent / 100)
    : Math.max(0, modalSubtotalUSD + 5 - normalizedOrderTotal);

  return (
    <div className='my-orders' data-currency={currencyConfig?.code}>
      <h2>My Orders</h2>
      <div className="container">
        {data.length === 0 ? (
          <div className="no-orders-box">
            <p className="no-orders-msg">No orders yet.</p>
          </div>
        ) : (
          data.map((order, index) => {
            return (
              <div key={order._id || index} className='my-orders-order'>
                <img src={assets.parcel_icon} alt="Order parcel" />
                <div className='my-orders-items-info'>
                  <p className='my-orders-items-text'>
                    {order.items.map((item, idx) => {
                      if (idx === order.items.length - 1) {
                        return item.name + " x " + item.quantity;
                      }
                      return item.name + " x " + item.quantity + ", ";
                    })}
                  </p>
                  {order.date && (
                    <span className='my-orders-date'>{formatDate(order.date)}</span>
                  )}
                </div>
                <div className='my-orders-price-col'>
                  <p className='my-orders-price-amount'>{formatPrice(order)}</p>
                  <span className='my-orders-payment-tag paid'>
                    Payment Confirmed
                  </span>
                </div>
                <p>Items: {order.items.length}</p>
                <p className='my-orders-status-text'>
                  <span>&#x25cf;</span> <b>{order.status}</b>
                </p>
                <button
                  type="button"
                  className="order-details-trigger-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  Order Details
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div
          className="order-details-modal-overlay"
          onClick={() => setSelectedOrder(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="order-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="order-modal-header">
              <div>
                <h3>Order Details</h3>
                <span className="order-modal-id">Order ID: {selectedOrder._id}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="order-modal-body">
              {/* Badges / metadata */}
              <div className="order-modal-badges">
                <div className="modal-badge-item">
                  <span className="badge-label">Payment Status:</span>
                  <span className="modal-payment-tag paid">Payment Confirmed</span>
                </div>
                <div className="modal-badge-item">
                  <span className="badge-label">Delivery Status:</span>
                  <span className="modal-status-tag">{selectedOrder.status}</span>
                </div>
                {selectedOrder.date && (
                  <div className="modal-badge-item">
                    <span className="badge-label">Order Date:</span>
                    <span className="modal-date-tag">{formatDate(selectedOrder.date)}</span>
                  </div>
                )}
              </div>

              {/* Items Section */}
              <div className="order-modal-section">
                <h4>Items in this order</h4>
                <div className="order-modal-items-list">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="order-modal-item-row">
                      {item.image && (
                        <img
                          className="modal-item-img"
                          src={`${url}/images/${item.image}`}
                          alt={item.name}
                        />
                      )}
                      <div className="modal-item-info">
                        <p className="modal-item-name">{item.name}</p>
                        <p className="modal-item-qty">
                          Quantity: <b>{item.quantity}</b> × {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="modal-item-total">
                        {formatPrice(Number(item.price || 0) * Number(item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div className="order-modal-section">
                  <h4>Delivery Address</h4>
                  <div className="order-modal-address">
                    <p>
                      <strong>Recipient:</strong> {selectedOrder.address.firstName} {selectedOrder.address.lastName}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedOrder.address.street}, {selectedOrder.address.city}, {selectedOrder.address.state}
                    </p>
                    {selectedOrder.address.phone && (
                      <p>
                        <strong>Phone:</strong> {selectedOrder.address.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Price Breakdown */}
              <div className="order-modal-pricing-breakdown">
                <h4>Order Summary</h4>
                <div className="modal-summary-row">
                  <span>Items Subtotal:</span>
                  <span>{formatPrice(modalSubtotalUSD)}</span>
                </div>
                {modalDiscountBase > 0.05 && (
                  <div className="modal-summary-row discount">
                    <span>Promo Discount:</span>
                    <span>-{formatPrice(modalDiscountBase)}</span>
                  </div>
                )}
                <div className="modal-summary-row">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(5)}</span>
                </div>
                <hr className="modal-summary-divider" />
                <div className="modal-summary-row total">
                  <b>Total Amount:</b>
                  <b>{formatPrice(selectedOrder)}</b>
                </div>
              </div>
            </div>

            <div className="order-modal-footer">
              <button
                type="button"
                className="modal-reorder-btn"
                onClick={() => handleReorder(selectedOrder)}
                disabled={reordering}
              >
                {reordering ? 'Adding to cart...' : 'Reorder'}
              </button>
              <button
                type="button"
                className="modal-dismiss-btn"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
