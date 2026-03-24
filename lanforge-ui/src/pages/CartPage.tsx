import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faCreditCard, faBuilding, faMobile, faLock, faTruck, faShieldAlt, faUndo } from '@fortawesome/free-solid-svg-icons';
import '../App.css';

interface CartItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  rawItem: any; // Keep the original reference to pass back to API
}

const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customDiscount, setCustomDiscount] = useState<number>(0);

  const fetchCart = () => {
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cartSessionId', sessionId);
    }
    
    fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`)
      .then(res => res.json())
      .then(data => {
        if (data.cart && data.cart.items) {
          const mapped = data.cart.items.map((item: any, index: number) => {
            const product = item.product || item.pcPart || item.accessory;
            const customBuild = item.customBuild;
            
            if (customBuild) {
              return {
                id: customBuild._id || index.toString(),
                name: customBuild.name || 'Custom Build',
                description: `Custom PC Build (${customBuild.parts?.length || 0} parts)`,
                price: item.price || customBuild.total || 0,
                quantity: item.quantity || 1,
                image: 'https://lanforge.co/cdn/shop/files/logo2.png?height=120&v=1763939118',
                category: 'Custom PC',
                rawItem: { customBuild: customBuild._id || customBuild }
              };
            }
            
            return {
              id: product?._id || index.toString(),
              name: product?.name || 'Item',
              description: product?.brand ? `${product.brand} - ${product.type}` : 'Component',
              price: item.price || product?.price || 0,
              quantity: item.quantity || 1,
              image: product?.images?.[0] || 'https://lanforge.co/cdn/shop/files/logo2.png?height=120&v=1763939118',
              category: product?.type || 'Component',
              rawItem: { 
                product: item.product?._id || item.product,
                pcPart: item.pcPart?._id || item.pcPart,
                accessory: item.accessory?._id || item.accessory,
              }
            };
          });
          setCartItems(mapped);
          setCustomDiscount(data.cart.customDiscountAmount || 0);
        }
      })
      .catch(err => console.error(err));
  };

  React.useEffect(() => {
    fetchCart();
    // Auto update cart from backend every 5 seconds to catch admin changes
    const interval = setInterval(() => {
      fetchCart();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const syncCartWithApi = (items: CartItem[], options: { clearDiscount?: boolean } = {}) => {
    const sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) return;
    
    const mappedItems = items.map(i => ({
      ...i.rawItem,
      quantity: i.quantity
    }));
    
    fetch(`${process.env.REACT_APP_API_URL}/carts/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: mappedItems, clearDiscount: options.clearDiscount })
    }).catch(err => console.error(err));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(id);
    } else {
      const updated = cartItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updated);
      syncCartWithApi(updated);
    }
  };

  const removeItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    syncCartWithApi(updated);
  };

  const clearAll = () => {
    setCartItems([]);
    setCustomDiscount(0);
    syncCartWithApi([], { clearDiscount: true });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return Math.max(0, calculateSubtotal() - customDiscount) * 0.08; // 8% tax on discounted amount
  };

  const calculateShipping = () => {
    return cartItems.length > 0 ? 49.99 : 0; // Flat rate shipping
  };

  const calculateTotal = () => {
    return Math.max(0, calculateSubtotal() - customDiscount + calculateTax() + calculateShipping());
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    window.location.href = '/checkout';
  };

  return (
    <div className="cart-page">
      <div className="container-narrow">
        <motion.div 
          className="cart-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1>Your Shopping Cart</h1>
          <p className="cart-subtitle">Review your items and proceed to checkout</p>
        </motion.div>

        <div className="cart-layout">
          <motion.div 
            className="cart-items"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">
                  <FontAwesomeIcon icon={faShoppingCart} className="text-4xl" />
                </div>
                <h2>Your cart is empty</h2>
                <p>Add some awesome PC components to get started!</p>
                <Link to="/configurator" className="btn btn-primary">
                  Start Building Your PC
                </Link>
              </div>
            ) : (
              <>
                <div className="cart-items-header">
                  <h2>Items ({cartItems.length})</h2>
                  <button 
                    className="btn btn-text"
                    onClick={clearAll}
                  >
                    Clear All
                  </button>
                </div>
                
                {cartItems.map((item, index) => (
                  <motion.div 
                    key={item.id}
                    className="cart-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  >
                    <div className="cart-item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-header">
                        <h3>{item.name}</h3>
                        <span className="cart-item-category">{item.category}</span>
                      </div>
                      <p className="cart-item-description">{item.description}</p>
                      <div className="cart-item-actions">
                        <div className="quantity-selector">
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </button>
                          <span className="quantity-value">{item.quantity}</span>
                          <button 
                            className="quantity-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button 
                          className="btn btn-text btn-danger"
                          onClick={() => removeItem(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      <div className="price-amount">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="price-unit">${item.price.toFixed(2)} each</div>
                    </div>
                  </motion.div>
                ))}
              </>
            )}
          </motion.div>

          <motion.div 
            className="cart-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>${calculateShipping().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%)</span>
                <span>${calculateTax().toFixed(2)}</span>
              </div>
              {customDiscount > 0 && (
                <div className="summary-row text-emerald-400">
                  <span>Custom Discount</span>
                  <span>-${customDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>

            <div className="summary-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>
              
              <Link to="/configurator" className="btn btn-secondary">
                Continue Shopping
              </Link>
              
              <div className="payment-methods">
                <p>Secure payment with:</p>
                <div className="payment-icons">
                  <span><FontAwesomeIcon icon={faCreditCard} /></span>
                  <span><FontAwesomeIcon icon={faBuilding} /></span>
                  <span><FontAwesomeIcon icon={faMobile} /></span>
                  <span><FontAwesomeIcon icon={faLock} /></span>
                </div>
              </div>
            </div>

            <div className="summary-features">
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faTruck} /></span>
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $2000</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faShieldAlt} /></span>
                <div>
                  <h4>1-Year Warranty</h4>
                  <p>All systems include warranty</p>
                </div>
              </div>
              <div className="feature">
                <span className="feature-icon"><FontAwesomeIcon icon={faUndo} /></span>
                <div>
                  <h4>30-Day Returns</h4>
                  <p>Hassle-free returns</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;