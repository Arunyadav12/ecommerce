import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Phone, MapPin, Clock, User, Package } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { useToast } from '../hooks/use-toast';

const OrderConfirmationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { getOrder } = useOrders();
  const [order, setOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('confirmed');
  const [loading, setLoading] = useState(true);
  
  const { orderId, orderData } = location.state || {};

  useEffect(() => {
    const initializeOrder = async () => {
      if (!orderId) {
        navigate('/home');
        return;
      }

      // If we have orderData from navigation state, use it initially
      if (orderData) {
        setOrder(orderData);
        setOrderStatus(orderData.status);
        setLoading(false);
      } else {
        // Otherwise fetch from API
        try {
          const result = await getOrder(orderId);
          if (result.success) {
            setOrder(result.order);
            setOrderStatus(result.order.status);
          } else {
            navigate('/home');
            return;
          }
        } catch (error) {
          navigate('/home');
          return;
        } finally {
          setLoading(false);
        }
      }

      // Simulate order status updates
      const statusUpdates = [
        { status: 'confirmed', delay: 0 },
        { status: 'preparing', delay: 3000 },
        { status: 'out_for_delivery', delay: 8000 }
      ];

      statusUpdates.forEach(({ status, delay }) => {
        setTimeout(() => {
          setOrderStatus(status);
          
          let message = '';
          switch (status) {
            case 'preparing':
              message = 'Your order is being prepared';
              break;
            case 'out_for_delivery':
              message = 'Your order is out for delivery!';
              break;
            default:
              break;
          }
          
          if (message) {
            toast({
              title: "Order Update",
              description: message
            });
          }
        }, delay);
      });
    };

    initializeOrder();
  }, [orderId, orderData, navigate, toast, getOrder]);

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Order Confirmed';
      case 'preparing':
        return 'Being Prepared';
      case 'out_for_delivery':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      default:
        return 'Processing';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'out_for_delivery':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-slate-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order || !orderId) {
    return null;
  }

  const deliveryPartner = order.delivery_partner || {
    name: "Ravi Kumar",
    phone: "+91 98765 43210"
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Success Message */}
        <Card className="text-center border-green-200 bg-green-50">
          <CardContent className="py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">Order Placed!</h1>
            <p className="text-green-700 mb-4">Your order has been successfully placed</p>
            <div className="bg-white rounded-lg p-3 inline-block">
              <p className="text-sm text-slate-600">Order ID</p>
              <p className="font-bold text-slate-800">{orderId}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current Status</span>
              <Badge className={getStatusColor(orderStatus)}>
                {getStatusText(orderStatus)}
              </Badge>
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              <div className={`flex items-center space-x-3 ${orderStatus === 'confirmed' || orderStatus === 'preparing' || orderStatus === 'out_for_delivery' ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-3 h-3 rounded-full ${orderStatus === 'confirmed' || orderStatus === 'preparing' || orderStatus === 'out_for_delivery' ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                <span className="text-sm font-medium">Order Confirmed</span>
              </div>
              
              <div className={`flex items-center space-x-3 ${orderStatus === 'preparing' || orderStatus === 'out_for_delivery' ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-3 h-3 rounded-full ${orderStatus === 'preparing' || orderStatus === 'out_for_delivery' ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                <span className="text-sm font-medium">Being Prepared</span>
              </div>
              
              <div className={`flex items-center space-x-3 ${orderStatus === 'out_for_delivery' ? 'text-green-600' : 'text-slate-400'}`}>
                <div className={`w-3 h-3 rounded-full ${orderStatus === 'out_for_delivery' ? 'bg-green-600' : 'bg-slate-300'}`}></div>
                <span className="text-sm font-medium">Out for Delivery</span>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">Estimated Delivery</span>
              </div>
              <p className="text-lg font-bold text-slate-800">30-45 minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-700">Delivery Address</p>
                <p className="text-sm text-slate-600">{order.delivery_address}</p>
              </div>
            </div>

            {orderStatus === 'out_for_delivery' && (
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Delivery Partner</span>
                </div>
                <p className="text-sm text-blue-700 mb-1">{deliveryPartner.name}</p>
                <p className="text-sm text-blue-600">{deliveryPartner.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.items && order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{item.name}</p>
                  <p className="text-sm text-slate-600">{item.quantity} × ₹{item.price}</p>
                </div>
                <p className="font-medium">₹{item.quantity * item.price}</p>
              </div>
            ))}
            
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-lg font-bold">Total Amount</span>
              <span className="text-lg font-bold">₹{order.total}</span>
            </div>
            
            <div className="bg-slate-50 rounded-lg p-3 mt-3">
              <p className="text-sm font-medium text-slate-700">Payment Method</p>
              <p className="text-sm text-slate-600">Cash on Delivery (COD)</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {orderStatus === 'out_for_delivery' && (
            <Button
              onClick={() => window.open(`tel:${deliveryPartner.phone}`)}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Delivery Partner
            </Button>
          )}

          <Button
            onClick={() => window.open('tel:+91 70000 70000')}
            variant="outline"
            className="w-full h-12"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call Support
          </Button>

          <Button
            onClick={() => navigate('/home')}
            variant="ghost"
            className="w-full h-12"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationScreen;