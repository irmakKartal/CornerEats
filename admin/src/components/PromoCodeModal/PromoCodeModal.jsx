import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { url } from '../../assets/assets';

const EMPTY_PROMO = { code: '', discountPercent: 10, isActive: true, description: '' };

const PromoCodeModal = ({ promo, onClose, onSaved }) => {
  const [form, setForm] = useState(EMPTY_PROMO);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(promo ? { ...promo } : EMPTY_PROMO);
  }, [promo]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const request = promo
        ? api.put(`${url}/api/promo/codes/${promo._id}`, form)
        : api.post(`${url}/api/promo/codes`, form);

      const response = await request;
      if (response.data.success) {
        onSaved(response.data.data);
        toast.success(response.data.message);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save promo code');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="promo-modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="promo-modal-header">
          <h3>{promo ? 'Edit Promo Code' : 'Add Promo Code'}</h3>
          <button type="button" className="promo-close-button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <form className="promo-modal-form" onSubmit={onSubmit}>
          <label>
            Promo code
            <input
              name="code"
              value={form.code}
              onChange={onChange}
              placeholder="SAVE20"
              maxLength="30"
              required
            />
          </label>

          <label>
            Discount percentage
            <input
              type="number"
              name="discountPercent"
              value={form.discountPercent}
              onChange={onChange}
              min="0"
              max="100"
              step="0.1"
              required
            />
          </label>

          <label>
            Description
            <input
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Optional description"
              maxLength="120"
            />
          </label>

          <label className="promo-status-row">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={onChange}
            />
            Active
          </label>

          <div className="promo-modal-actions">
            <button type="button" className="promo-cancel-button" onClick={onClose}>Cancel</button>
            <button type="submit" className="promo-save-button" disabled={submitting}>
              {submitting ? 'Saving...' : promo ? 'Save Changes' : 'Add Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

PromoCodeModal.propTypes = {
  promo: PropTypes.shape({
    _id: PropTypes.string,
    code: PropTypes.string,
    discountPercent: PropTypes.number,
    isActive: PropTypes.bool,
    description: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

PromoCodeModal.defaultProps = {
  promo: null,
};

export default PromoCodeModal;
