import { useContext, useEffect, useRef, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { formatPrice, getCurrencyConfig } from '../../utils/currency';

const PlaceOrder = () => {
    const [submitting, setSubmitting] = useState(false);
    const userEditedAddress = useRef(false);

    const [data, setData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        street: "",
        city: "",
        state: "",
        zipcode: "",
        country: "",
        phone: ""
    })

    const { getSubtotal, getDiscountAmount, getTotalCartAmount, token, food_list, cartItems, url, promoSettings, currencyConfig } = useContext(StoreContext);

    const navigate = useNavigate();
    const { code, rate } = currencyConfig || getCurrencyConfig();
    const subtotal = getSubtotal();
    const discountAmount = getDiscountAmount();
    const baseAmount = getTotalCartAmount();
    const convertedAmount = baseAmount * rate;
    const deliveryFee = 5 * rate;
    const totalAmount = convertedAmount + deliveryFee;

    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        userEditedAddress.current = true;
        setData(data => ({ ...data, [name]: value }))
    }

    const placeOrder = async (e) => {
        e.preventDefault()
        if (submitting) return;
        setSubmitting(true);

        const orderItems = food_list
            .filter((item) => cartItems[item._id] > 0)
            .map((item) => ({
                _id: item._id,
                quantity: cartItems[item._id],
            }));
        const orderData = {
            address: data,
            items: orderItems,
            amount: Number(totalAmount.toFixed(2)),
            currency: code,
            promoCode: promoSettings.code,
            discountPercent: promoSettings.discountPercent,
        }
        try {
            const response = await axios.post(url + "/api/order/place", orderData, { headers: { token } });
            if (response.data.success && response.data.session_url) {
                window.location.assign(response.data.session_url);
                return;
            }

            toast.error(response.data.message || "Unable to start payment. Please try again.");
        } catch (error) {
            toast.error(error.response?.data?.message || "Unable to connect to the payment service. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    useEffect(() => {
        if (token) {
            let isMounted = true;
            axios.get(url + "/api/user/profile", { headers: { token } })
                .then((response) => {
                    const savedAddress = response.data.data?.deliveryAddress;
                    if (isMounted && !userEditedAddress.current && savedAddress) {
                        setData((current) => ({ ...current, ...savedAddress }));
                    }
                })
                .catch((error) => console.error("Unable to load saved delivery information", error));

            return () => {
                isMounted = false;
            };
        }
        return undefined;
    }, [token, url]);

    useEffect(() => {
        if (!token) {
            toast.error("to place an order sign in first")
            navigate('/cart')
        }
        else if (getTotalCartAmount() === 0) {
            navigate('/cart')
        }
    }, [getTotalCartAmount, navigate, token])

    return (
        <form onSubmit={placeOrder} className='place-order'>
            <div className="place-order-left">
                <p className='title'>Delivery Information</p>
                <div className="multi-field">
                    <input type="text" name='firstName' onChange={onChangeHandler} value={data.firstName} placeholder='First name' required />
                    <input type="text" name='lastName' onChange={onChangeHandler} value={data.lastName} placeholder='Last name' required />
                </div>
                <input type="email" name='email' onChange={onChangeHandler} value={data.email} placeholder='Email address' required />
                <input type="text" name='street' onChange={onChangeHandler} value={data.street} placeholder='Street' required />
                <div className="multi-field">
                    <input type="text" name='city' onChange={onChangeHandler} value={data.city} placeholder='City' required />
                    <input type="text" name='state' onChange={onChangeHandler} value={data.state} placeholder='State' required />
                </div>
                <div className="multi-field">
                    <input type="text" name='zipcode' onChange={onChangeHandler} value={data.zipcode} placeholder='Zip code' required />
                    <input type="text" name='country' onChange={onChangeHandler} value={data.country} placeholder='Country' required />
                </div>
                <input type="text" name='phone' onChange={onChangeHandler} value={data.phone} placeholder='Phone' required />
            </div>
            <div className="place-order-right">
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
                        <div className="cart-total-details"><p>Delivery Fee</p><p>{formatPrice(subtotal === 0 ? 0 : 5)}</p></div>
                        <hr />
                        <div className="cart-total-details"><b>Total</b><b>{formatPrice(subtotal === 0 ? 0 : baseAmount + 5)}</b></div>
                    </div>
                </div>
                <button className='place-order-submit' type='submit' disabled={submitting}>
                    {submitting ? 'Connecting to payment...' : 'Proceed To Payment'}
                </button>
            </div>
        </form>
    )
}

export default PlaceOrder
