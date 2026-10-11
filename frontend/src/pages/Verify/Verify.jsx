import axios from 'axios';
import { useCallback, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext';
import './Verify.css';

const Verify = () => {
  const { url, token, setCartItems } = useContext(StoreContext);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const sessionId = searchParams.get("session_id");
  const isCanceled = searchParams.get("cancel") === "true";

  const navigate = useNavigate();

  const verifyPayment = useCallback(async () => {
    if (isCanceled) {
      toast.info("Payment cancelled");
      navigate("/cart");
      return;
    }

    if (!orderId || !sessionId) {
      navigate("/");
      return;
    }

    const authToken = token || localStorage.getItem("token");
    if (!authToken) {
      toast.error("Please login to verify payment");
      navigate("/cart");
      return;
    }

    try {
      let response;
      try {
        response = await axios.post(
          url + "/api/order/verify",
          { orderId, sessionId },
          { headers: { token: authToken } }
        );
      } catch (firstError) {
        // Retry once after 2.5 seconds in case of mobile wallet or webhook settlement delay
        await new Promise((resolve) => setTimeout(resolve, 2500));
        response = await axios.post(
          url + "/api/order/verify",
          { orderId, sessionId },
          { headers: { token: authToken } }
        );
      }

      if (response.data.success) {
        setCartItems({});
        toast.success("Payment confirmed successfully!");
        navigate("/myorders");
      } else {
        toast.error(response.data.message || "Payment verification failed");
        navigate("/cart");
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      toast.error(error.response?.data?.message || "Payment verification failed");
      navigate("/cart");
    }
  }, [isCanceled, navigate, orderId, sessionId, token, url, setCartItems]);

  useEffect(() => {
    verifyPayment();
  }, [verifyPayment]);

  return (
    <div className='verify'>
      <div className="spinner"></div>
    </div>
  );
};

export default Verify;
