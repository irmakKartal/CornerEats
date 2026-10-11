import { createContext, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { menu_list } from "../assets/assets";
import axios from "axios";
import { getCurrencyConfig, onCurrencyChange, initCurrency } from "../utils/currency";

const DEFAULT_PROMO = { code: '', discountPercent: 0, isActive: false };

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {

    const url = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const [food_list, setFoodList] = useState([]);
    const [cartItems, setCartItems] = useState({});
    const [token, setToken] = useState(() => localStorage.getItem("token") || "");
    const [promoSettings, setPromoSettings] = useState(DEFAULT_PROMO);
    const [searchQuery, setSearchQuery] = useState("");
    const [currencyConfig, setCurrencyConfig] = useState(() => getCurrencyConfig());


    const addToCart = async (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        }
        else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
        if (token) {
            await axios.post(url + "/api/cart/add", { itemId }, { headers: { token } });
        }
    }

    const removeFromCart = async (itemId) => {
        setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }))
        if (token) {
            await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
        }
    }

    const deleteFromCart = async (itemId) => {
        const count = cartItems[itemId] || 0;
        setCartItems((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
        });
        if (token && count > 0) {
            for (let i = 0; i < count; i++) {
                await axios.post(url + "/api/cart/remove", { itemId }, { headers: { token } });
            }
        }
    }

    const addMultipleToCart = async (items) => {
        if (!Array.isArray(items) || !items.length) return;
        setCartItems((prev) => {
            const next = { ...prev };
            for (const item of items) {
                if (item?._id) {
                    next[item._id] = (next[item._id] || 0) + (Number(item.quantity) || 1);
                }
            }
            return next;
        });

        const activeToken = token || localStorage.getItem("token");
        if (activeToken) {
            for (const item of items) {
                if (item?._id) {
                    const count = Number(item.quantity) || 1;
                    for (let i = 0; i < count; i++) {
                        await axios.post(url + "/api/cart/add", { itemId: item._id }, { headers: { token: activeToken } });
                    }
                }
            }
        }
    }

    const getSubtotal = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                const itemInfo = food_list.find((product) => product._id === item);
                totalAmount += itemInfo ? itemInfo.price * cartItems[item] : 0;
            }
        }
        return totalAmount;
    };

    const getDiscountAmount = () => {
        const subtotal = getSubtotal();
        const discountPercent = promoSettings.code ? Number(promoSettings.discountPercent) : 0;
        return subtotal * (discountPercent / 100);
    };

    const getTotalCartAmount = () => {
        return getSubtotal() - getDiscountAmount();
    };

    const fetchFoodList = useCallback(async () => {
        const response = await axios.get(url + "/api/food/list");
        setFoodList(response.data.data)
    }, [url]);

    const loadCartData = useCallback(async (token) => {
        const response = await axios.post(url + "/api/cart/get", {}, { headers: token });
        setCartItems(response.data.cartData);
    }, [url]);

    useEffect(() => {
        async function loadData() {
            await fetchFoodList();
            if (localStorage.getItem("token")) {
                setToken(localStorage.getItem("token"))
                await loadCartData({ token: localStorage.getItem("token") })
            }
        }
        loadData()
    }, [fetchFoodList, loadCartData])

    useEffect(() => {
        initCurrency(url);
        return onCurrencyChange((newConfig) => {
            setCurrencyConfig(newConfig);
        });
    }, [url]);

    const contextValue = {
        url,
        food_list,
        menu_list,
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        addMultipleToCart,
        getTotalCartAmount,
        getSubtotal,
        getDiscountAmount,
        promoSettings,
        setPromoSettings,
        searchQuery,
        setSearchQuery,
        token,
        setToken,
        loadCartData,
        setCartItems,
        currencyConfig
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {children}
        </StoreContext.Provider>
    )

}

StoreContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default StoreContextProvider;
