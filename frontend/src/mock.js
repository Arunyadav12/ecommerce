// Mock data for wholesale e-commerce app

export const mockProducts = [
  {
    id: 1,
    name: "Onion 1kg",
    price: 45,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
    unit: "kg",
    minOrder: 5
  },
  {
    id: 2,
    name: "Potato 1kg",
    price: 35,
    category: "Vegetables", 
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&h=200&fit=crop",
    unit: "kg",
    minOrder: 10
  },
  {
    id: 3,
    name: "Tomato 1kg",
    price: 60,
    category: "Vegetables",
    image: "https://images.unsplash.com/photo-1546470427-e3b9b6808c38?w=300&h=200&fit=crop",
    unit: "kg",
    minOrder: 5
  },
  {
    id: 4,
    name: "Rice 10kg",
    price: 450,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=200&fit=crop",
    unit: "bag",
    minOrder: 2
  },
  {
    id: 5,
    name: "Wheat Flour 5kg", 
    price: 200,
    category: "Grains",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop",
    unit: "bag",
    minOrder: 4
  },
  {
    id: 6,
    name: "Milk 1L",
    price: 55,
    category: "Dairy",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=200&fit=crop",
    unit: "bottle",
    minOrder: 12
  },
  {
    id: 7,
    name: "Eggs (30 pcs)",
    price: 180,
    category: "Dairy", 
    image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=300&h=200&fit=crop",
    unit: "tray",
    minOrder: 2
  },
  {
    id: 8,
    name: "Turmeric Powder 500g",
    price: 120,
    category: "Spices",
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&h=200&fit=crop",
    unit: "pack",
    minOrder: 6
  },
  {
    id: 9,
    name: "Red Chili Powder 500g",
    price: 150,
    category: "Spices",
    image: "https://images.unsplash.com/photo-1583058138034-bfea558b26e2?w=300&h=200&fit=crop",
    unit: "pack", 
    minOrder: 6
  },
  {
    id: 10,
    name: "Bread (20 pcs)",
    price: 80,
    category: "Bakery",
    image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=200&fit=crop",
    unit: "pack",
    minOrder: 5
  }
];

export const mockCategories = [
  { id: 1, name: "Vegetables", icon: "Carrot" },
  { id: 2, name: "Grains", icon: "Wheat" },
  { id: 3, name: "Dairy", icon: "Milk" },
  { id: 4, name: "Spices", icon: "Sparkles" },
  { id: 5, name: "Bakery", icon: "Cookie" }
];

export const mockOrders = [
  {
    id: "ORD-1234",
    items: [
      { productId: 1, quantity: 10, price: 45 },
      { productId: 2, quantity: 15, price: 35 }
    ],
    total: 975,
    status: "confirmed",
    estimatedDelivery: "30-45 minutes",
    deliveryAddress: "Shop No. 15, Main Market, Sector 22",
    createdAt: new Date(),
    deliveryPartner: {
      name: "Ravi Kumar",
      phone: "+91 98765 43210"
    }
  }
];

// Cart management using localStorage
export const getCart = () => {
  const cart = localStorage.getItem('wholesale_cart');
  return cart ? JSON.parse(cart) : [];
};

export const saveCart = (cart) => {
  localStorage.setItem('wholesale_cart', JSON.stringify(cart));
};

export const clearCart = () => {
  localStorage.removeItem('wholesale_cart');
};

// User management
export const getCurrentUser = () => {
  const user = localStorage.getItem('wholesale_user');
  return user ? JSON.parse(user) : null;
};

export const saveUser = (user) => {
  localStorage.setItem('wholesale_user', JSON.stringify(user));
};

export const clearUser = () => {
  localStorage.removeItem('wholesale_user');
};