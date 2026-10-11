import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { url } from '../../assets/assets';
import './EditFoodModal.css';

const EditFoodModal = ({ item, onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Salad' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name || '',
        description: item.description || '',
        price: item.price || '',
        category: item.category || 'Salad',
      });
      setImage(null);
    }
  }, [item]);

  useEffect(() => {
    if (!image) {
      setImagePreview(item ? `${url}/images/${item.image}` : '');
      return undefined;
    }

    const previewUrl = URL.createObjectURL(image);
    setImagePreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [image, item]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('id', item._id);
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('price', String(Number(form.price)));
      formData.append('category', form.category);
      if (image) formData.append('image', image);

      const response = await api.post(`${url}/api/food/update`, formData);

      if (response.data.success) {
        toast.success(response.data.message);
        onSaved(response.data.data);
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update food');
    } finally {
      setSaving(false);
    }
  };

  if (!item) return null;

  return (
    <div className="edit-food-modal-backdrop" onClick={onClose}>
      <div className="edit-food-modal" onClick={(event) => event.stopPropagation()}>
        <div className="edit-food-modal-header">
          <h3>Edit Food</h3>
          <button type="button" className="edit-food-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="edit-food-form" onSubmit={handleSubmit}>
          <label className="edit-food-image-field">
            Food image
            <div className="edit-food-image-preview">
              <img src={imagePreview} alt={form.name || item.name} />
              <span>{image ? image.name : 'Current image'}</span>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setImage(event.target.files?.[0] || null)}
            />
          </label>
          <label>
            Food name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Description
            <textarea name="description" rows="4" value={form.description} onChange={handleChange} required />
          </label>
          <div className="edit-food-grid">
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="Salad">Salad</option>
                <option value="Rolls">Rolls</option>
                <option value="Deserts">Deserts</option>
                <option value="Sandwich">Sandwich</option>
                <option value="Cake">Cake</option>
                <option value="Pure Veg">Pure Veg</option>
                <option value="Pasta">Pasta</option>
                <option value="Noodles">Noodles</option>
              </select>
            </label>
            <label>
              Price
              <input type="number" name="price" value={form.price} min="0" step="0.01" onChange={handleChange} required />
            </label>
          </div>
          <div className="edit-food-actions">
            <button type="button" className="edit-food-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="edit-food-submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditFoodModal.propTypes = {
  item: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    category: PropTypes.string,
    image: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
};

export default EditFoodModal;
