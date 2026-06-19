import React, { useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS-pages/Checkout.css";

const API_BASE_URL = "";

const initialForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  paymentMethod: "Cash on Delivery",
};

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [pincodeError, setPincodeError] = useState("");

  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "null");
    } catch {
      return null;
    }
  }, []);

  const cartItems = useMemo(
    () => (Array.isArray(location.state?.cartItems) ? location.state.cartItems : []),
    [location.state?.cartItems]
  );
  const totalAmount = Number(location.state?.totalAmount || 0);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const address = `${form.fullName}, ${form.phone}, ${form.addressLine}, ${form.city}, ${form.state} - ${form.pincode}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : name === "pincode"
          ? value.replace(/\D/g, "").slice(0, 6)
          : value;

    if (name === "phone") {
      if (!nextValue) {
        setPhoneError("");
      } else if (!/^[6-9]\d{9}$/.test(nextValue)) {
        setPhoneError("Enter a valid 10-digit phone number");
      } else {
        setPhoneError("");
      }
    }

    if (name === "pincode") {
      if (!nextValue) {
        setPincodeError("");
      } else if (!/^\d{6}$/.test(nextValue)) {
        setPincodeError("Enter a valid 6-digit pincode");
      } else {
        setPincodeError("");
      }
    }

    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePlaceOrder = async () => {
    if (isSubmitting) {
      return;
    }

    if (!storedUser || storedUser.role !== "client") {
      alert("Please login as a client first");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      navigate("/cart");
      return;
    }

    if (
      !form.fullName ||
      !form.phone ||
      !form.addressLine ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all checkout details");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setPhoneError("Enter a valid 10-digit phone number");
      alert("Please enter a valid phone number");
      return;
    }

    if (!/^\d{6}$/.test(form.pincode)) {
      setPincodeError("Enter a valid 6-digit pincode");
      alert("Please enter a valid pincode");
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        userId: storedUser.id,
        items: cartItems.map((item) => ({
          foodId: item.foodId?._id,
          quantity: Number(item.quantity || 1),
        })),
        totalAmount,
        address,
      };

      const orderResponse = await axios.post(`${API_BASE_URL}/api/orders/place`, orderPayload);
      const orderId = orderResponse.data?.order?._id;

      if (!orderId) {
        throw new Error("Order was created without an order id");
      }

      if (form.paymentMethod === "Cash on Delivery") {
        await axios.post(`${API_BASE_URL}/api/payments/add`, {
          orderId,
          userId: storedUser.id,
          amount: totalAmount,
          paymentMethod: form.paymentMethod,
          paymentStatus: "Pending",
        });
      } else {
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error("Unable to load Razorpay checkout");
        }

        const razorpayOrderResponse = await axios.post(
          `${API_BASE_URL}/api/payments/razorpay/order`,
          {
            orderId,
            amount: totalAmount,
          }
        );

        const { keyId, order } = razorpayOrderResponse.data;

        await new Promise((resolve, reject) => {
          const razorpay = new window.Razorpay({
            key: keyId,
            amount: order.amount,
            currency: order.currency,
            name: "Nutricart",
            description: `${form.paymentMethod} payment`,
            order_id: order.id,
            prefill: {
              name: form.fullName,
              contact: form.phone,
            },
            method: {
              upi: form.paymentMethod === "UPI",
              card: form.paymentMethod === "Card",
              netbanking: false,
              wallet: false,
            },
            handler: async (response) => {
              try {
                await axios.post(`${API_BASE_URL}/api/payments/razorpay/verify`, {
                  orderId,
                  userId: storedUser.id,
                  amount: totalAmount,
                  paymentMethod: form.paymentMethod,
                  ...response,
                });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled")),
            },
            theme: {
              color: "#1f6046",
            },
          });

          razorpay.open();
        });
      }

      await axios.delete(`${API_BASE_URL}/api/carts/clear/${storedUser.id}`);

      alert(
        form.paymentMethod === "Cash on Delivery"
          ? "Order placed successfully"
          : "Payment successful and order placed"
      );
      navigate("/client-dashboard");
    } catch (error) {
      console.log("Checkout error:", error.response?.data || error.message);
      alert(error.response?.data?.message || error.message || "Unable to place order");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!storedUser || storedUser.role !== "client") {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <h1>Checkout</h1>
            <p>Please login as a client to continue.</p>
            <button type="button" onClick={() => navigate("/login")}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <h1>Checkout</h1>
            <p>No cart items found. Add foods before checkout.</p>
            <button type="button" onClick={() => navigate("/menu")}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-topbar">
          <button type="button" className="checkout-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        <section className="checkout-hero">
          <div>
            <p className="checkout-kicker">Checkout</p>
            <h1>Confirm your order</h1>
            <p>Fill delivery details, review your foods, and place the client order.</p>
          </div>
        </section>

        <div className="checkout-layout">
          <section className="checkout-form-card">
            <h2>Delivery details</h2>

            <div className="checkout-grid">
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                inputMode="numeric"
                maxLength="10"
              />
              {phoneError ? <p className="checkout-field-error">{phoneError}</p> : null}
              <input
                name="addressLine"
                value={form.addressLine}
                onChange={handleChange}
                placeholder="Address"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
              />
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
              />
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                inputMode="numeric"
                maxLength="6"
              />
              {pincodeError ? <p className="checkout-field-error">{pincodeError}</p> : null}
            </div>

            <div className="payment-block">
              <h3>Payment method</h3>
              <select
                name="paymentMethod"
                value={form.paymentMethod}
                onChange={handleChange}
              >
                <option>Cash on Delivery</option>
                <option>UPI</option>
                <option>Card</option>
              </select>
            </div>
          </section>

          <aside className="checkout-summary-card">
            <h2>Order summary</h2>

            <div className="checkout-summary-list">
              {cartItems.map((item) => (
                <div className="checkout-item" key={item._id}>
                  <div>
                    <strong>{item.foodId?.name || "Food item"}</strong>
                    <span>
                      Qty {item.quantity} x Rs. {item.foodId?.price || 0}
                    </span>
                  </div>
                  <b>Rs. {(Number(item.quantity || 0) * Number(item.foodId?.price || 0)).toFixed(0)}</b>
                </div>
              ))}
            </div>

            <div className="checkout-row">
              <span>Items</span>
              <strong>{cartItems.length}</strong>
            </div>
            <div className="checkout-row">
              <span>Total quantity</span>
              <strong>{totalQuantity}</strong>
            </div>
            <div className="checkout-row total">
              <span>Total amount</span>
              <strong>Rs. {totalAmount}</strong>
            </div>

            <button
              type="button"
              className="checkout-primary-btn"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
