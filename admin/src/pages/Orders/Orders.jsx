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
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'paid' | 'unpaid' | 'archived' | 'trash'
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

  // Real-time live status updates
  useEffect(() => {
    fetchAllOrders();

    const interval = setInterval(() => {
      fetchAllOrders();
    }, 5000);

    const handleFocus = () => {
      fetchAllOrders();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const statusHandler = async (event, orderId) => {
    try {
      const response = await api.post(`${url}/api/order/status`, {
        orderId,
        status: event.target.value,
      });
      if (response.data.success) {
        toast.success('Order status updated');
        await fetchAllOrders();
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to update order');
      }
    }
  };

  // Move order to Trash (Soft delete)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Move this order to trash?')) return;
    try {
      const response = await api.delete(`${url}/api/order/${orderId}`);
      if (response.data.success) {
        toast.success(response.data.message || 'Order moved to trash');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to delete order');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to delete order');
      }
    }
  };

  // Archive an order
  const handleArchiveOrder = async (orderId) => {
    try {
      const response = await api.post(`${url}/api/order/archive/${orderId}`);
      if (response.data.success) {
        toast.success('Order archived');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to archive order');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to archive order');
      }
    }
  };

  // Restore order from Archive
  const handleUnarchiveOrder = async (orderId) => {
    try {
      const response = await api.post(`${url}/api/order/unarchive/${orderId}`);
      if (response.data.success) {
        toast.success('Order restored to active orders');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to unarchive order');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to unarchive order');
      }
    }
  };

  // Restore order from Trash
  const handleRestoreOrder = async (orderId) => {
    try {
      const response = await api.post(`${url}/api/order/restore/${orderId}`);
      if (response.data.success) {
        toast.success('Order restored from trash');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to restore order');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to restore order');
      }
    }
  };

  // Permanently delete order from DB
  const handlePermanentDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this order? This action cannot be undone.')) return;
    try {
      const response = await api.delete(`${url}/api/order/permanent/${orderId}`);
      if (response.data.success) {
        toast.success('Order permanently deleted');
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || 'Unable to permanently delete order');
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.message || 'Unable to delete order');
      }
    }
  };

  const activeOrders = orders.filter((order) => !order.isArchived && !order.isDeleted);
  const paidCount = activeOrders.filter((order) => order.payment).length;
  const unpaidCount = activeOrders.filter((order) => !order.payment).length;
  const archivedCount = orders.filter((order) => order.isArchived && !order.isDeleted).length;
  const trashCount = orders.filter((order) => order.isDeleted).length;

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Tab filter
        if (activeTab === 'active') {
          if (order.isArchived || order.isDeleted) return false;
        } else if (activeTab === 'paid') {
          if (order.isArchived || order.isDeleted || !order.payment) return false;
        } else if (activeTab === 'unpaid') {
          if (order.isArchived || order.isDeleted || order.payment) return false;
        } else if (activeTab === 'archived') {
          if (!order.isArchived || order.isDeleted) return false;
        } else if (activeTab === 'trash') {
          if (!order.isDeleted) return false;
        }

        // Order status filter (for operational orders)
        if (statusFilter !== 'all') {
          if (!order.payment) return false;
          if (order.status !== statusFilter) return false;
        }

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
  }, [orders, activeTab, statusFilter, sortBy, searchQuery]);

  const hasActiveFilters =
    statusFilter !== 'all' ||
    sortBy !== 'date-new' ||
    searchQuery.trim() !== '';

  const resetAllFilters = () => {
    setStatusFilter('all');
    setSortBy('date-new');
    setSearchQuery('');
  };

  return (
    <div className='order add'>
      <div className='order-header-section'>
        <div className='order-title-row'>
          <div>
            <div className='order-title-live'>
              <h3>Orders Management</h3>
              <span className='order-live-pulse' title='Live real-time sync active'>
                <span className='pulse-dot'></span> Live
              </span>
            </div>
            <p className='order-subtitle'>
              Showing {filteredAndSortedOrders.length} orders
            </p>
          </div>

          {/* Section & Status Filter Tabs */}
          <div className='order-filter-tabs'>
            <button
              type='button'
              className={`filter-tab ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => setActiveTab('active')}
            >
              Active <span className='filter-count'>{activeOrders.length}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${activeTab === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid <span className='filter-count paid-count'>{paidCount}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${activeTab === 'unpaid' ? 'active' : ''}`}
              onClick={() => setActiveTab('unpaid')}
            >
              Unpaid <span className='filter-count unpaid-count'>{unpaidCount}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              📦 Archived <span className='filter-count archived-count'>{archivedCount}</span>
            </button>
            <button
              type='button'
              className={`filter-tab ${activeTab === 'trash' ? 'active' : ''}`}
              onClick={() => setActiveTab('trash')}
            >
              🗑️ Trash <span className='filter-count trash-count'>{trashCount}</span>
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
            {/* Filter by Order Status (for non-trash/unpaid views) */}
            {activeTab !== 'unpaid' && activeTab !== 'trash' && (
              <div className='filter-select-group'>
                <label htmlFor='statusFilter'>Status:</label>
                <select
                  id='statusFilter'
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label='Filter by order status'
                >
                  <option value='all'>All Statuses</option>
                  <option value='Pending'>Pending</option>
                  <option value='Food Processing'>Food Processing</option>
                  <option value='Out for delivery'>Out for delivery</option>
                  <option value='Delivered'>Delivered</option>
                </select>
              </div>
            )}

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
            <p>
              {activeTab === 'archived'
                ? 'No archived orders.'
                : activeTab === 'trash'
                ? 'Trash is empty.'
                : 'No orders matching your criteria.'}
            </p>
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
            <div
              key={order._id}
              className={`order-item ${order.isDeleted ? 'item-in-trash' : ''} ${order.isArchived ? 'item-archived' : ''}`}
            >
              <img src={assets.parcel_icon} alt='Order parcel' />
              <div>
                <div className='order-item-id-badge'>
                  <span className='id-label'>Order ID:</span>
                  <code className='id-value'>#{order._id}</code>
                  {order.isArchived && !order.isDeleted && (
                    <span className='order-state-tag archived'>📦 Archived</span>
                  )}
                  {order.isDeleted && (
                    <span className='order-state-tag trash'>🗑️ In Trash</span>
                  )}
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
                {/* 1. TRASH TAB ACTIONS */}
                {order.isDeleted ? (
                  <div className='trash-actions-box'>
                    <span className='trash-hint-tag'>Deleted</span>
                    <button
                      type='button'
                      className='order-restore-btn'
                      onClick={() => handleRestoreOrder(order._id)}
                      title='Restore order from trash'
                    >
                      ↺ Restore
                    </button>
                    <button
                      type='button'
                      className='order-permanent-delete-btn'
                      onClick={() => handlePermanentDeleteOrder(order._id)}
                      title='Permanently delete from database'
                    >
                      ✕ Delete Forever
                    </button>
                  </div>
                ) : order.isArchived ? (
                  /* 2. ARCHIVED TAB ACTIONS */
                  <div className='archived-actions-box'>
                    <span className='archived-status-tag'>Status: {order.status}</span>
                    <button
                      type='button'
                      className='order-restore-btn'
                      onClick={() => handleUnarchiveOrder(order._id)}
                      title='Restore to active orders'
                    >
                      ↺ Unarchive
                    </button>
                    <button
                      type='button'
                      className='order-delete-btn'
                      onClick={() => handleDeleteOrder(order._id)}
                      title='Move to trash'
                    >
                      Move to Trash
                    </button>
                  </div>
                ) : order.payment ? (
                  /* 3. ACTIVE PAID ORDERS */
                  <div className='paid-status-box'>
                    <select
                      onChange={(e) => statusHandler(e, order._id)}
                      value={order.status || 'Pending'}
                      aria-label='Order status'
                    >
                      <option value='Pending'>Pending</option>
                      <option value='Food Processing'>Food Processing</option>
                      <option value='Out for delivery'>Out for delivery</option>
                      <option value='Delivered'>Delivered</option>
                    </select>
                    {order.status === 'Delivered' && (
                      <div className='completed-actions-row'>
                        <button
                          type='button'
                          className='order-archive-btn'
                          onClick={() => handleArchiveOrder(order._id)}
                          title='Move completed order to archive'
                        >
                          📦 Archive
                        </button>
                        <button
                          type='button'
                          className='order-delete-btn'
                          onClick={() => handleDeleteOrder(order._id)}
                          title='Move order to trash'
                        >
                          Trash
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 4. ACTIVE UNPAID ORDERS */
                  <div className='unpaid-status-box'>
                    <span className='unpaid-no-status-badge'>— No Status</span>
                    <small className='unpaid-status-hint'>Awaiting payment</small>
                    <button
                      type='button'
                      className='order-delete-btn'
                      onClick={() => handleDeleteOrder(order._id)}
                      title='Delete unpaid abandoned order'
                    >
                      Move to Trash
                    </button>
                  </div>
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
