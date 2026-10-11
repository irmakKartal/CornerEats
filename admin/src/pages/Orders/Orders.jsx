import { useEffect, useState, useMemo } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { assets, url } from '../../assets/assets';
import { formatPrice, formatDate, getExchangeRate, onCurrencyChange } from '../../utils/currency';

const getNormalizedAmount = (order) => {
  const amt = Number(order?.amount || 0);
  const currency = (order?.currency || 'USD').toUpperCase();
  const rate = getExchangeRate(currency);
  return rate > 0 ? amt / rate : amt;
};

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-new');
  const [searchQuery, setSearchQuery] = useState('');
  const [, setCurrencyTrigger] = useState(0);

  useEffect(() => {
    return onCurrencyChange(() => {
      setCurrencyTrigger((prev) => prev + 1);
    });
  }, []);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get(`${url}/api/order/list`);
      if (response.data.success) {
        const sortedOrders = [...response.data.data].sort((a, b) => {
          const timeA = new Date(a.date || 0).getTime();
          const timeB = new Date(b.date || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return String(b._id).localeCompare(String(a._id));
        });
        setOrders(sortedOrders);
      } else {
        toast.error(response.data.message || 'Unable to load orders');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to load orders');
      }
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await api.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        await fetchAllOrders();
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to update order');
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const paidCount = orders.filter((order) => order.payment).length;
  const unpaidCount = orders.filter((order) => !order.payment).length;

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Payment filter
        if (paymentFilter === 'paid' && !order.payment) return false;
        if (paymentFilter === 'unpaid' && order.payment) return false;

        // Order status filter
        if (statusFilter !== 'all' && order.status !== statusFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const query = searchQuery.trim().toLowerCase();
          const idMatch = String(order._id || '').toLowerCase().includes(query);
          const nameMatch = `${order.address?.firstName || ''} ${order.address?.lastName || ''}`
            .toLowerCase()
            .includes(query);
          const phoneMatch = String(order.address?.phone || '').toLowerCase().includes(query);
          const foodMatch = order.items?.some((i) =>
            String(i.name || '').toLowerCase().includes(query)
          );
          if (!idMatch && !nameMatch && !phoneMatch && !foodMatch) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-new') {
          const timeA = new Date(a.date || 0).getTime();
          const timeB = new Date(b.date || 0).getTime();
          if (timeB !== timeA) return timeB - timeA;
          return String(b._id).localeCompare(String(a._id));
        }
        if (sortBy === 'date-old') {
          const timeA = new Date(a.date || 0).getTime();
          const timeB = new Date(b.date || 0).getTime();
          if (timeA !== timeB) return timeA - timeB;
          return String(a._id).localeCompare(String(b._id));
        }
        if (sortBy === 'price-high') {
          return getNormalizedAmount(b) - getNormalizedAmount(a);
        }
        if (sortBy === 'price-low') {
          return getNormalizedAmount(a) - getNormalizedAmount(b);
        }
        return 0;
      });
  }, [orders, paymentFilter, statusFilter, sortBy, searchQuery]);

  const hasActiveFilters =
    paymentFilter !== 'all' ||
    statusFilter !== 'all' ||
    sortBy !== 'date-new' ||
    searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setPaymentFilter('all');
    setStatusFilter('all');
    setSortBy('date-new');
    setSearchQuery('');
  };

  return (
    <div className='order add'>
      <div className='order-header-section'>
        <div className='order-title-row'>
          <div>
            <h3>Orders Management</h3>
            <p className='order-subtitle'>
              Showing {filteredAndSortedOrders.length} of {orders.length} orders
            </p>
          </div>

          {/* Payment filter tabs */}
          <div className='order-filter-tabs'>
            <button
              type='button'
              className={`filter-tab ${paymentFilter === 'all' ? 'active' : ''}`}
              onClick={() => setPaymentFilter('all')}
            >
              All Orders <span className='filter-count'>{orders.length}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${paymentFilter === 'paid' ? 'active' : ''}`}
              onClick={() => setPaymentFilter('paid')}
            >
              Paid <span className='filter-count paid-count'>{paidCount}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${paymentFilter === 'unpaid' ? 'active' : ''}`}
              onClick={() => setPaymentFilter('unpaid')}
            >
              Unpaid <span className='filter-count unpaid-count'>{unpaidCount}</span>
            </button>
          </div>
        </div>

        {/* Extended Toolbar: Search, Status Filter, Sorting */}
        <div className='order-filter-toolbar'>
          {/* Search Box */}
          <div className='order-search-box'>
            <input
              type='text'
              placeholder='Search by Order ID, name, phone...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label='Search orders'
            />
            {searchQuery && (
              <button
                type='button'
                className='clear-search-btn'
                onClick={() => setSearchQuery('')}
                title='Clear search'
              >
                ✕
              </button>
            )}
          </div>

          <div className='order-filter-selects'>
            {/* Filter by Order Status */}
            <div className='filter-select-group'>
              <label htmlFor='statusFilter'>Status:</label>
              <select
                id='statusFilter'
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label='Filter by order status'
              >
                <option value='all'>All Statuses</option>
                <option value='Food Processing'>Food Processing</option>
                <option value='Out for delivery'>Out for delivery</option>
                <option value='Delivered'>Delivered</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className='filter-select-group'>
              <label htmlFor='sortBy'>Sort by:</label>
              <select
                id='sortBy'
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label='Sort orders'
              >
                <option value='date-new'>Newest First</option>
                <option value='date-old'>Oldest First</option>
                <option value='price-high'>Highest Price</option>
                <option value='price-low'>Lowest Price</option>
              </select>
            </div>

            {/* Reset button */}
            {hasActiveFilters && (
              <button
                type='button'
                className='reset-filters-btn'
                onClick={resetAllFilters}
                title='Reset all filters'
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className='order-list'>
        {filteredAndSortedOrders.length === 0 ? (
          <div className='order-empty-state'>
            <p>No orders matching your criteria.</p>
            {hasActiveFilters && (
              <button
                type='button'
                className='reset-empty-btn'
                onClick={resetAllFilters}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedOrders.map((order) => (
            <div key={order._id} className='order-item'>
              <img src={assets.parcel_icon} alt='Order parcel' />
              <div>
                <div className='order-item-id-badge'>
                  <span className='id-label'>Order ID:</span>
                  <code className='id-value'>#{order._id}</code>
                </div>
                <p className='order-item-food'>
                  {order.items.map((item, index) => {
                    if (index === order.items.length - 1) {
                      return item.name + ' x ' + item.quantity;
                    }
                    return item.name + ' x ' + item.quantity + ', ';
                  })}
                </p>
                <p className='order-item-name'>
                  {order.address.firstName + ' ' + order.address.lastName}
                </p>
                <div className='order-item-address'>
                  <p>{order.address.street + ','}</p>
                  <p>
                    {order.address.city +
                      ', ' +
                      order.address.state +
                      ', ' +
                      order.address.country +
                      ', ' +
                      order.address.zipcode}
                  </p>
                </div>
                <p className='order-item-phone'>{order.address.phone}</p>
                <p className='order-item-date'>
                  <span className='date-label'>Order Date:</span> {formatDate(order.date)}
                </p>
              </div>

              <div className='order-item-summary'>
                <p className='order-items-count'>Items: {order.items.length}</p>
                <div className='order-payment-box'>
                  <span className={`payment-status-badge ${order.payment ? 'paid' : 'unpaid'}`}>
                    {order.payment ? '✓ Paid' : '⏳ Unpaid'}
                  </span>
                  {!order.payment && (
                    <small className='payment-unverified-tag'>Not Verified</small>
                  )}
                </div>
              </div>

              <div className='order-item-pricing'>
                <p className='order-price-value'>{formatPrice(order)}</p>
              </div>

              <div className='order-status-action'>
                <select
                  onChange={(e) => statusHandler(e, order._id)}
                  value={order.status}
                  disabled={!order.payment}
                  title={!order.payment ? 'Cannot change status until payment is confirmed' : 'Order status'}
                  aria-label='Order status'
                >
                  <option value='Pending'>Pending</option>
                  <option value='Food Processing'>Food Processing</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
                </select>
                {!order.payment && (
                  <p className='unpaid-status-hint'>⚠️ Disabled: Payment pending</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Order;
