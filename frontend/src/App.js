import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import OnboardingScreen from "./components/OnboardingScreen";
import HomeScreen from "./components/HomeScreen";
import CartScreen from "./components/CartScreen";
import OrderConfirmationScreen from "./components/OrderConfirmationScreen";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto"></div>
        <p className="mt-2 text-slate-600">Loading...</p>
      </div>
    </div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<OnboardingScreen />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              } />
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartScreen />
                </ProtectedRoute>
              } />
              <Route path="/order-confirmation" element={
                <ProtectedRoute>
                  <OrderConfirmationScreen />
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;