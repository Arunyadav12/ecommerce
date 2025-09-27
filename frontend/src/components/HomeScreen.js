import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Search, Plus, Minus, ShoppingCart, Store, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProducts, useCategories } from '../hooks/useProducts';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/use-toast';

const HomeScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const { addToCart, getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [quantities, setQuantities] = useState({});

  // Fetch products and categories from API
  const { products, loading: productsLoading, error: productsError } = useProducts(selectedCategory, searchQuery);
  const { categories, loading: categoriesLoading } = useCategories();

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const newQuantity = Math.max(1, current + change);
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handleAddToCart = (product) => {
    const quantity = quantities[product.id] || 1;
    addToCart(product, quantity);
    toast({
      title: "Added to Cart",
      description: `${quantity} ${product.unit} of ${product.name} added`
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartCount = getCartCount();

  if (productsError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load products</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-slate-800">WholeMart</h1>
                <p className="text-xs text-slate-600">{user?.shop_name}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-slate-600"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-slate-50 border-slate-200"
            />
          </div>

          {/* Categories */}
          {!categoriesLoading && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                onClick={() => setSelectedCategory('')}
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  variant={selectedCategory === category.name ? 'default' : 'outline'}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-md mx-auto px-4 py-4 pb-24">
        {productsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex space-x-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-800 truncate">{product.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    
                    <p className="text-lg font-bold text-slate-900 mb-1">
                      ₹{product.price}/<span className="text-sm font-normal">{product.unit}</span>
                    </p>
                    
                    <p className="text-xs text-slate-500 mb-3">
                      Min order: {product.min_order} {product.unit}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
                        <Button
                          onClick={() => handleQuantityChange(product.id, -1)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-200"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="w-8 text-center text-sm font-medium">
                          {quantities[product.id] || 1}
                        </span>
                        
                        <Button
                          onClick={() => handleQuantityChange(product.id, 1)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:bg-slate-200"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

            {products.length === 0 && (
              <div className="text-center py-8">
                <p className="text-slate-500">No products found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 right-4 left-4 max-w-md mx-auto">
          <Button
            onClick={() => navigate('/cart')}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white h-14 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({cartCount} items)
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;