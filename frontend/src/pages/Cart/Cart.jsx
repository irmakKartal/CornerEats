import { useContext, useState } from 'react'
import './Cart.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { formatPrice } from '../../utils/currency';
import axios from 'axios';
import { toast } from 'react-toastify';

const Cart = () => {

  const {cartItems, food_list, addToCart, removeFromCart, deleteFromCart, getSubtotal, getDiscountAmount, getTotalCartAmount, promoSettings, url, setPromoSettings} = useContext(StoreContext);
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const deliveryFee = 5;
  const total = subtotal === 0 ? 0 : getTotalCartAmount() + deliveryFee;

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Enter a promo code');
      return;
    }

    try {
      const response = await axios.post(url + '/api/promo/validate', { code: promoCode });
      if (response.data.success) {
        setPromoSettings(response.data.data);
        setPromoApplied(true);
        setPromoError('');
        toast.success('Promo code applied');
      }
    } catch (error) {
      setPromoApplied(false);
      setPromoError(error.response?.data?.message || 'Unable to apply promo code');
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoError('');
    setPromoSettings({ ...promoSettings, code: '', discountPercent: 0, isActive: false });
  };

  return (
    <div className='cart'>
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p> <p>Title</p> <p>Price</p> <p>Quantity</p> <p>Total</p> <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item, index) => {
          if (cartItems[item._id]>0) {
            return (<div key={index}>
              <div className="cart-items-title cart-items-item">
                <img className="cart-item-image" src={url+"/images/"+item.image} alt={item.name} />
                <p>{item.name}</p>
                <p>{formatPrice(item.price)}</p>
                <div className="cart-items-counter">
                  <img src={assets.remove_icon_red} onClick={() => removeFromCart(item._id)} alt="Decrease" />
                  <p>{cartItems[item._id]}</p>
                  <img src={assets.add_icon_green} onClick={() => addToCart(item._id)} alt="Increase" />
                </div>
                <p>{formatPrice(item.price * cartItems[item._id])}</p>
                <p className='cart-items-remove-icon' onClick={()=>deleteFromCart(item._id)}>x</p>
              </div>
              <hr />
            </div>)
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>{formatPrice(subtotal)}</p></div>
            <hr />
            {discountAmount > 0 && (
              <>
                <div className="cart-total-details"><p>Discount</p><p>-{formatPrice(discountAmount)}</p></div>
                <hr />
              </>
            )}
            <div className="cart-total-details"><p>Delivery Fee</p><p>{formatPrice(subtotal === 0 ? 0 : deliveryFee)}</p></div>
            <hr />
            <div className="cart-total-details"><b>Total</b><b>{formatPrice(subtotal === 0 ? 0 : total)}</b></div>
          </div>
          <button onClick={()=>navigate('/order')}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cart-promocode">
          <div>
            <p>If you have a promo code, Enter it here</p>
            <div className='cart-promocode-input'>
              <input
                type="text"
                placeholder='promo code'
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && applyPromoCode()}
              />
              <button type="button" onClick={applyPromoCode}>Submit</button>
            </div>
            {promoError && <p className='cart-promocode-error'>{promoError}</p>}
            {promoApplied && (
              <button type="button" className="cart-promocode-remove" onClick={removePromoCode}>Remove promo code</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
