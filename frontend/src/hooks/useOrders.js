import { useState } from 'react';
import { ordersAPI } from '../services/api';
import { useToast } from './use-toast';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createOrder = async (orderData) => {
    try {
      setLoading(true);
      const response = await ordersAPI.createOrder(orderData);
      return { success: true, order: response.data };
    } catch (error) {
      console.error('Failed to create order:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to place order';
      toast({
        title: "Order Failed",
        description: errorMessage,
        variant: "destructive"
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const getOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(orderId);
      return { success: true, order: response.data };
    } catch (error) {
      console.error('Failed to fetch order:', error);
      return { success: false, error: 'Failed to load order' };
    } finally {
      setLoading(false);
    }
  };

  const getUserOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getUserOrders();
      return { success: true, orders: response.data };
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      return { success: false, error: 'Failed to load orders' };
    } finally {
      setLoading(false);
    }
  };

  return {
    createOrder,
    getOrder,
    getUserOrders,
    loading
  };
};