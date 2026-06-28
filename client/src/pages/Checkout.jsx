import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../CSS-pages/Checkout.css";

// Uses the CRA proxy locally and the same-origin /api server when deployed.
// Set REACT_APP_API_BASE_URL only when the API is hosted on another domain.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const initialForm = {
  fullName: "",
  phone: "",
  alternatePhone: "",
  addressLine: "",
  landmark: "",
  location: "",
  city: "",
  state: "",
  pincode: "",
  paymentMethod: "Cash on Delivery",
  preparationInstructions: "",
};

const buildCheckoutFormFromUser = (user) => {
  const address = user?.address || {};
  const addressParts =
    typeof address === "string"
      ? address.split(",").map((part) => part.trim())
      : [];

  return {
    ...initialForm,
    fullName: user?.name || "",
    phone: user?.phone || "",
    alternatePhone: "",
    addressLine:
      typeof address === "string" ? addressParts[0] || "" : address.street || "",
    landmark: typeof address === "string" ? "" : address.landmark || "",
    location: typeof address === "string" ? "" : address.location || address.area || "",
    city: typeof address === "string" ? addressParts[1] || "" : address.city || "",
    state: typeof address === "string" ? addressParts[2] || "" : address.state || "",
    pincode:
      typeof address === "string"
        ? (address.match(/\b\d{6}\b/) || [""])[0]
        : address.pincode || "",
  };
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
  const [useDifferentAddress, setUseDifferentAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [alternatePhoneError, setAlternatePhoneError] = useState("");
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

  useEffect(() => {
    if (!storedUser) return;
    setForm(buildCheckoutFormFromUser(storedUser));
  }, [storedUser]);

  const totalQuantity = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [cartItems]
  );

  const address = [
    form.fullName,
    form.phone,
    form.alternatePhone ? `Alt: ${form.alternatePhone}` : "",
    form.addressLine,
    form.landmark ? `Near ${form.landmark}` : "",
    form.location,
    form.city,
    `${form.state} - ${form.pincode}`,
  ]
    .filter(Boolean)
    .join(", ");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue =
      name === "phone" || name === "alternatePhone"
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

    if (name === "alternatePhone") {
      if (!nextValue) {
        setAlternatePhoneError("");
      } else if (!/^[6-9]\d{9}$/.test(nextValue)) {
        setAlternatePhoneError("Enter a valid 10-digit alternate number");
      } else {
        setAlternatePhoneError("");
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
      (useDifferentAddress && !form.location) ||
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

    if (form.alternatePhone && !/^[6-9]\d{9}$/.test(form.alternatePhone)) {
      setAlternatePhoneError("Enter a valid 10-digit alternate number");
      alert("Please enter a valid alternate mobile number");
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
        preparationInstructions: form.preparationInstructions.trim(),
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
          transactionId: "",
        });
      } else {
        const razorpayOrderResponse = await axios.post(
          `${API_BASE_URL}/api/payments/razorpay/order`,
          {
            orderId,
            amount: totalAmount,
          }
        );

        const { demo, keyId, order } = razorpayOrderResponse.data;

        if (demo) {
          const approved = window.confirm(
            `Razorpay Demo Payment\n\nAmount: Rs. ${totalAmount}\n\nThis is a simulated payment for project demonstration. Continue?`
          );
          if (!approved) throw new Error("Demo payment cancelled");

          await axios.post(`${API_BASE_URL}/api/payments/razorpay/verify`, {
            orderId,
            userId: storedUser.id,
            amount: totalAmount,
            paymentMethod: "Razorpay Demo",
            razorpay_order_id: order.id,
            razorpay_payment_id: `demo_pay_${Date.now()}`,
            demo: true,
          });
        } else {
          const scriptLoaded = await loadRazorpayScript();

          if (!scriptLoaded) {
            throw new Error("Unable to load Razorpay checkout");
          }

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
              upi: true,
              card: true,
              netbanking: true,
              wallet: true,
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
      }

      await axios.delete(`${API_BASE_URL}/api/carts/clear/${storedUser.id}`);

      const successMessage =
        form.paymentMethod === "Cash on Delivery"
          ? "Order placed successfully"
          : "Razorpay payment successful and order placed";

      alert(successMessage);
      navigate("/orders", { state: { confirmedOrderId: orderId } });
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

            <div className="saved-delivery-box">
              <div>
                <span>Saved delivery details</span>
                <strong>{storedUser.name}</strong>
                <p>{address}</p>
              </div>
              <label>
                <input
                  type="checkbox"
                  checked={useDifferentAddress}
                  onChange={(e) => setUseDifferentAddress(e.target.checked)}
                />
                Add different address
              </label>
            </div>

            <div className="checkout-grid">
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Full name"
                disabled={!useDifferentAddress}
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone number"
                inputMode="numeric"
                maxLength="10"
                disabled={!useDifferentAddress}
              />
              {phoneError ? <p className="checkout-field-error">{phoneError}</p> : null}
              <input
                name="alternatePhone"
                value={form.alternatePhone}
                onChange={handleChange}
                placeholder="Alternate mobile number (optional)"
                inputMode="numeric"
                maxLength="10"
                disabled={!useDifferentAddress}
              />
              {alternatePhoneError ? (
                <p className="checkout-field-error">{alternatePhoneError}</p>
              ) : null}
                  <input
                    name="addressLine"
                    value={form.addressLine}
                    onChange={handleChange}
                    placeholder="Street address"
                    disabled={!useDifferentAddress}
                  />
              <input
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="Landmark (optional)"
                disabled={!useDifferentAddress}
              />
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Location / Area"
                disabled={!useDifferentAddress}
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                disabled={!useDifferentAddress}
              />
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                disabled={!useDifferentAddress}
              />
              <input
                name="pincode"
                value={form.pincode}
                onChange={handleChange}
                placeholder="Pincode"
                inputMode="numeric"
                maxLength="6"
                disabled={!useDifferentAddress}
              />
              {pincodeError ? <p className="checkout-field-error">{pincodeError}</p> : null}
            </div>

            <div className="preparation-block">
              <label htmlFor="preparationInstructions">Meal preparation suggestion <span>(optional)</span></label>
              <p>Tell the kitchen how you would like your meal prepared.</p>
              <textarea
                id="preparationInstructions"
                name="preparationInstructions"
                value={form.preparationInstructions}
                onChange={handleChange}
                maxLength="300"
                rows="4"
                placeholder="For example: less spicy, dressing on the side, no onion, or add cutlery"
              />
              <small>{form.preparationInstructions.length}/300</small>
            </div>

            <div className="payment-block">
              <h3>Payment method</h3>
              <div className="payment-options" role="group" aria-label="Payment method">
                <button
                  type="button"
                  className={form.paymentMethod === "Cash on Delivery" ? "selected" : ""}
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: "Cash on Delivery" }))}
                >
                  <strong>Cash on Delivery</strong>
                  <span>Pay when your meal arrives</span>
                </button>
                <button
                  type="button"
                  className={form.paymentMethod === "Razorpay" ? "selected" : ""}
                  onClick={() => setForm((prev) => ({ ...prev, paymentMethod: "Razorpay" }))}
                >
                  <strong>Pay with Razorpay</strong>
                  <span>UPI, card, netbanking or wallet</span>
                </button>
              </div>
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
