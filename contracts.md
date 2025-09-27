# Wholesale E-commerce App - Backend Integration Contracts

## API Endpoints to Implement

### 1. Authentication Endpoints
```
POST /api/auth/register
- Body: { shopName, mobile, location, password }
- Response: { user: {id, shopName, mobile, location}, token }

POST /api/auth/login  
- Body: { mobile, password }
- Response: { user: {id, shopName, mobile, location}, token }

GET /api/auth/me
- Headers: Authorization: Bearer <token>
- Response: { user: {id, shopName, mobile, location} }
```

### 2. Products Endpoints
```
GET /api/products
- Query: ?category=<category>&search=<query>
- Response: { products: [{id, name, price, category, image, unit, minOrder}] }

GET /api/products/:id
- Response: { product: {id, name, price, category, image, unit, minOrder} }

GET /api/categories
- Response: { categories: [{id, name, icon}] }
```

### 3. Cart & Orders Endpoints
```
POST /api/orders
- Headers: Authorization: Bearer <token>
- Body: { items: [{productId, quantity, price}], total, deliveryAddress }
- Response: { order: {id, items, total, status, estimatedDelivery, deliveryAddress, createdAt} }

GET /api/orders/:orderId
- Headers: Authorization: Bearer <token>
- Response: { order: {id, items, total, status, estimatedDelivery, deliveryAddress, createdAt, deliveryPartner} }

GET /api/orders
- Headers: Authorization: Bearer <token>
- Response: { orders: [{id, items, total, status, estimatedDelivery, deliveryAddress, createdAt}] }

PATCH /api/orders/:orderId/status
- Body: { status: "confirmed" | "preparing" | "out_for_delivery" | "delivered" }
- Response: { order: {id, status} }
```

## Mock Data to Replace

### From `mock.js`:
1. **mockProducts** → Replace with MongoDB Product collection
2. **mockCategories** → Replace with MongoDB Category collection  
3. **mockOrders** → Replace with MongoDB Order collection
4. **localStorage user management** → Replace with JWT authentication
5. **localStorage cart management** → Move to session-based or user-associated carts

## MongoDB Models

### 1. User Model
```javascript
{
  _id: ObjectId,
  shopName: String,
  mobile: String (unique),
  location: String,
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Product Model
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  category: String,
  image: String,
  unit: String,
  minOrder: Number,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Category Model
```javascript
{
  _id: ObjectId,
  name: String,
  icon: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Order Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  orderId: String (unique, auto-generated),
  items: [{
    productId: ObjectId (ref: Product),
    name: String,
    quantity: Number,
    price: Number,
    unit: String
  }],
  subtotal: Number,
  deliveryFee: Number,
  total: Number,
  deliveryAddress: String,
  status: String (enum: "confirmed", "preparing", "out_for_delivery", "delivered"),
  estimatedDelivery: String,
  deliveryPartner: {
    name: String,
    phone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Frontend Integration Changes

### 1. Replace localStorage authentication with JWT
- Store JWT token in localStorage
- Add Authorization header to all authenticated requests
- Update CartContext to work with authenticated user
- Redirect to login if token expires

### 2. Replace mock API calls in components:

#### OnboardingScreen.js
- Replace `saveUser()` with API calls to `/api/auth/register` and `/api/auth/login`

#### HomeScreen.js  
- Replace `mockProducts` with API call to `/api/products`
- Replace `mockCategories` with API call to `/api/categories`
- Replace `getCurrentUser()` with API call to `/api/auth/me`

#### CartScreen.js
- Replace local cart storage with user session or API-based cart
- Replace order placement with API call to `/api/orders`

#### OrderConfirmationScreen.js
- Replace mock order data with API call to `/api/orders/:orderId`
- Add real-time status updates via API polling or WebSocket

### 3. Add error handling and loading states
- Show loading spinners during API calls
- Handle API errors with proper user feedback
- Add network error handling

### 4. Add API service layer
- Create `src/services/api.js` for centralized API calls
- Create `src/services/auth.js` for authentication logic
- Create `src/contexts/AuthContext.js` for global auth state

## Implementation Priority

1. **Setup MongoDB models and seed data**
2. **Implement authentication endpoints with JWT**
3. **Implement products and categories endpoints**
4. **Implement orders management endpoints**  
5. **Update frontend to use real APIs**
6. **Add comprehensive error handling**
7. **Test complete user flow**

## Security Considerations

- Hash passwords using bcrypt
- Validate JWT tokens on protected routes
- Sanitize user inputs
- Add rate limiting for auth endpoints
- Validate order ownership before allowing access