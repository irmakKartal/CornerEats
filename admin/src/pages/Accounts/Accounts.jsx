import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { url } from '../../assets/assets';
import './Accounts.css';

const PAGE_SIZE = 20;

const formatAddress = (address) => {
  if (!address) return 'Not provided';

  return [
    address.street,
    address.city,
    address.state,
    address.zipcode,
    address.country,
  ].filter(Boolean).join(', ') || 'Not provided';
};

const formatRegistrationDate = (account) => {
  const objectIdTimestamp = Number.parseInt(String(account._id).slice(0, 8), 16);
  const date = account.createdAt
    ? new Date(account.createdAt)
    : new Date(objectIdTimestamp * 1000);

  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCurrentRequest = true;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`${url}/api/user/admin/list`, {
          params: { page, limit: PAGE_SIZE, search },
        });
        if (isCurrentRequest && response.data.success) {
          setAccounts(response.data.data);
          setPagination(response.data.pagination);
        }
      } catch (error) {
        if (isCurrentRequest) {
          toast.error(error.response?.data?.message || 'Unable to load accounts');
        }
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    }, 200);

    return () => {
      isCurrentRequest = false;
      clearTimeout(timeout);
    };
  }, [page, search]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <section className="accounts-page">
      <header className="accounts-header">
        <div>
          <p className="accounts-eyebrow">Customer management</p>
          <h1>Accounts</h1>
          <p className="accounts-count">{pagination.total} registered accounts</p>
        </div>
        <label className="accounts-search">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={handleSearch}
            placeholder="Name or email"
            aria-label="Search accounts by name or email"
          />
        </label>
      </header>

      <div className="accounts-table-wrap">
        <table className="accounts-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Delivery address</th>
              <th>Phone</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account._id}>
                <td className="accounts-name">{account.name || 'Unnamed account'}</td>
                <td>{account.email}</td>
                <td className="accounts-address">{formatAddress(account.deliveryAddress)}</td>
                <td>{account.deliveryAddress?.phone || 'Not provided'}</td>
                <td>{formatRegistrationDate(account)}</td>
              </tr>
            ))}
            {!loading && accounts.length === 0 && (
              <tr>
                <td className="accounts-empty" colSpan="5">
                  {search ? 'No accounts match this search.' : 'No accounts registered yet.'}
                </td>
              </tr>
            )}
            {loading && accounts.length === 0 && (
              <tr>
                <td className="accounts-empty" colSpan="5">Loading accounts...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="accounts-pagination">
        <span>Page {pagination.page} of {Math.max(pagination.pages, 1)}</span>
        <div>
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>
            Previous
          </button>
          <button type="button" onClick={() => setPage((current) => Math.min(pagination.pages, current + 1))} disabled={page >= pagination.pages || loading}>
            Next
          </button>
        </div>
      </footer>
    </section>
  );
};

export default Accounts;
