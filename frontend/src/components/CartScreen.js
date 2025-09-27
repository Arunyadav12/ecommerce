import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ArrowLeft, Plus, Minus, Trash2, MapPin, CreditCard, Truck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../hooks/use-toast';

const CartScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { createOrder, loading: orderLoading } = useOrders();
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location || '');

  const deliveryFee = 50;
  const subtotal = getCartTotal();
  const total = subtotal + deliveryFee;

  const handleQuantityChange = (productId, change) => {
    const item = cartItems.find(item => item.productId === productId);
    if (item) {
      updateQuantity(productId, item.quantity + change);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to cart before placing order",
        variant: "destructive"
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Delivery Address Required",
        description: "Please enter a delivery address",
        variant: "destructive"
      });
      return;
    }

    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit
      })),
      total,
      delivery_address: deliveryAddress
    };

    // Place order via API
    const result = await createOrder(orderData);
    
    if (result.success) {
      const orderId = result.order.order_id;
      clearCart();
      
      toast({
        title: "Order Placed!",
        description: `Order ${orderId} has been confirmed`
      });
      
      // Navigate to confirmation screen
      navigate('/order-confirmation', { 
        state: { 
          orderId,
          orderData: result.order
        }
      });
    }
    // Error handling is done in useOrders hook
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => navigate('/home')}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-slate-800">Your Cart</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-slate-500 mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/home')}>
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map(item => (
                <div key={item.productId} className="flex items-center space-x-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 truncate">{item.name}</h4>
                    <p className="text-sm text-slate-600">₹{item.price}/{item.unit}</p>
                    <p className="text-sm font-semibold text-slate-800">
                      Subtotal: ₹{item.price * item.quantity}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1">
                      <Button
                        onClick={() => handleQuantityChange(item.productId, -1)}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      
                      <Button
                        onClick={() => handleQuantityChange(item.productId, 1)}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      onClick={() => removeFromCart(item.productId)}
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Delivery Address */}
        {cartItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="address">Delivery Address</Label>
                <Input
                  id="address"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address"
                  className="h-12"
                />
                <p className="text-xs text-slate-500">
                  Confirm or update your delivery address
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        {cartItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Delivery Fee</span>
                <span className="font-medium">₹{deliveryFee}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              {/* Payment Method */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-slate-600" />
                  <span className="text-sm font-medium">Payment Method</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">Cash on Delivery (COD)</p>
              </div>

              {/* Estimated Delivery */}
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Estimated Delivery</span>
                </div>
                <p className="text-sm text-green-700 mt-1">30-45 minutes</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Place Order Button */}
        {cartItems.length > 0 && (
          <Button
            onClick={handlePlaceOrder}
            disabled={orderLoading}
            className="w-full h-14 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50"
          >
            {orderLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Placing Order...
              </div>
            ) : (
              `Place Order - ₹${total}`
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CartScreen;