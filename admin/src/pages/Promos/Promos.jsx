import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { url } from '../../assets/assets';
import PromoCodeModal from '../../components/PromoCodeModal/PromoCodeModal';
import './Promos.css';

const Promos = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPromos = useCallback(async () => {
    try {
      const response = await api.get(`${url}/api/promo/codes`);
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load promo codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const openCreateModal = () => {
    setSelectedPromo(null);
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setSelectedPromo(promo);
    setShowModal(true);
  };

  const handleSaved = (promo) => {
    setPromos((current) => {
      const existing = current.find((item) => item._id === promo._id);
      if (existing) {
        return current.map((item) => (item._id === promo._id ? promo : item));
      }
      return [promo, ...current];
    });
  };

  const deletePromo = async (promo) => {
    if (!window.confirm(`Delete promo code ${promo.code}?`)) return;

    try {
      const response = await api.delete(`${url}/api/promo/codes/${promo._id}`);
      if (response.data.success) {
        setPromos((current) => current.filter((item) => item._id !== promo._id));
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete promo code');
    }
  };

  return (
    <div className="promos add">
      <div className="promos-header">
        <div>
          <p className="promos-label">Promo codes</p>
          <h3>Manage available discounts</h3>
        </div>
        <button type="button" className="promos-add-button" onClick={openCreateModal}>
          + Add Promo Code
        </button>
      </div>

      <div className="promos-table-wrapper">
        {loading ? (
          <p className="promos-empty">Loading promo codes...</p>
        ) : promos.length === 0 ? (
          <div className="promos-empty">
            <p>No promo codes available.</p>
            <button type="button" className="promos-add-button" onClick={openCreateModal}>Add your first code</button>
          </div>
        ) : (
          <table className="promos-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Description</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo) => (
                <tr key={promo._id}>
                  <td><strong>{promo.code}</strong></td>
                  <td>{promo.discountPercent}%</td>
                  <td>{promo.description || '—'}</td>
                  <td>
                    <span className={`promo-status-badge ${promo.isActive ? 'active' : 'inactive'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(promo.updatedAt || promo.createdAt).toLocaleDateString()}</td>
                  <td className="promos-actions">
                    <button type="button" className="promo-edit-button" onClick={() => openEditModal(promo)}>
                      Edit
                    </button>
                    <button type="button" className="promo-delete-button" onClick={() => deletePromo(promo)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <PromoCodeModal
          promo={selectedPromo}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default Promos;
