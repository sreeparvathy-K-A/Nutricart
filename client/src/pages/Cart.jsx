import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS-pages/Cart.css";

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://nutricart-waly.onrender.com";

function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const storedUser = JSON.parse(localStorage.getItem("userInfo") || "null");
  const userId = storedUser?.id || "";
  const userRole = storedUser?.role || "";

  const fetchCart = useCallback(async () => {
    if (userRole !== "client") {
      setCartItems([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/carts/${userId}`);
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Fetch cart error:", error.response?.data || error.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (cartId, quantity) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/carts/${cartId}`, { quantity });

      setCartItems((prev) =>
        prev.map((item) => (item._id === cartId ? response.data.cart : item))
      );
    } catch (error) {
      console.log("Update quantity error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to update quantity");
    }
  };

  const removeItem = async (cartId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/carts/${cartId}`);
      setCartItems((prev) => prev.filter((item) => item._id !== cartId));
    } catch (error) {
      console.log("Remove cart item error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to remove item");
    }
  };

  const clearCart = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/api/carts/clear/${userId}`);
      setCartItems([]);
    } catch (error) {
      console.log("Clear cart error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Unable to clear cart");
    }
  };

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.foodId?.price || 0);
      const quantity = Number(item.quantity || 0);
      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  if (!storedUser || storedUser.role !== "client") {
    return (
      <div className="cart-page">
        <div className="cart-shell">
          <button type="button" className="cart-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <div className="cart-empty-state">
            <h1>Cart</h1>
            <p>Please login as a client to view and manage cart items.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-shell">
        <div className="cart-topbar">
          <button type="button" className="cart-back-btn" onClick={() => navigate(-1)}>
            Back
          </button>
          <button
            type="button"
            className="cart-secondary-btn"
            onClick={() => navigate("/menu")}
          >
            Add More Foods
          </button>
        </div>

        <section className="cart-hero">
          <div>
            <p className="cart-kicker">Your order</p>
            <h1>Cart items ready for checkout</h1>
            <p className="cart-subtext">
              Review foods, adjust quantities, and confirm the items you want to order.
            </p>
          </div>
          {cartItems.length > 0 ? (
            <button type="button" className="cart-secondary-btn danger" onClick={clearCart}>
              Clear Cart
            </button>
          ) : null}
        </section>

        {loading ? (
          <div className="cart-empty-state">
            <p>Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="cart-empty-state">
            <h2>Your cart is empty</h2>
            <p>Add food from the menu to start an order.</p>
            <button type="button" className="cart-primary-btn" onClick={() => navigate("/menu")}>
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="cart-layout">
            <section className="cart-list">
              {cartItems.map((item) => {
                const food = item.foodId || {};
                const imageUrl = food.image?.startsWith("/uploads")
                  ? `${API_BASE_URL}${food.image}`
                  : food.image;

                return (
                  <article className="cart-card" key={item._id}>
                    <img src={imageUrl} alt={food.name} />

                    <div className="cart-card-body">
                      <div className="cart-card-head">
                        <div>
                          {food.hotelName ? (
                            <p className="cart-hotel">{food.hotelName}</p>
                          ) : null}
                          <h3>{food.name || "Food item"}</h3>
                          {food.location ? (
                            <p className="cart-location">{food.location}</p>
                          ) : null}
                        </div>
                        <strong>Rs. {food.price || 0}</strong>
                      </div>

                      <p className="cart-description">
                        {food.description || "Freshly prepared menu item."}
                      </p>

                      <div className="cart-meta">
                        <span>{food.category || "General"}</span>
                        <span>{food.calories || 0} kcal</span>
                        <span>{food.protein || 0}g protein</span>
                      </div>

                      <div className="cart-actions">
                        <div className="quantity-box">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeItem(item._id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <p className="cart-kicker">Summary</p>
              <h2>Order overview</h2>
              <div className="summary-row">
                <span>Items</span>
                <strong>{cartItems.length}</strong>
              </div>
              <div className="summary-row">
                <span>Total quantity</span>
                <strong>
                  {cartItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0)}
                </strong>
              </div>
              <div className="summary-row total">
                <span>Total amount</span>
                <strong>Rs. {totalAmount}</strong>
              </div>

              <button
                type="button"
                className="cart-primary-btn"
                onClick={() =>
                  navigate("/checkout", {
                    state: {
                      cartItems,
                      totalAmount,
                    },
                  })
                }
              >
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;
