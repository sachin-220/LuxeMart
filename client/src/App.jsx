import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import CartDrawer from './components/CartDrawer';

// Scroll to top helper component
function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, search]);

  return null;
}

import Home from './pages/Home';

// Lazy loaded routes
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SignIn = lazy(() => import('./pages/SignIn'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Membership = lazy(() => import('./pages/Membership'));
const MembershipPayment = lazy(() => import('./pages/MembershipPayment'));
const MembershipSuccess = lazy(() => import('./pages/MembershipSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Invoice = lazy(() => import('./pages/Invoice'));
const PaymentResult = lazy(() => import('./pages/PaymentResult'));

// Admin Routes
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />
      <main className="container flex-col" style={{ flexGrow: 1, padding: '2rem 1.5rem', width: '100%' }}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/membership-payment" element={<MembershipPayment />} />
            <Route path="/membership-success" element={<MembershipSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/payment-result" element={<PaymentResult />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            backdropFilter: 'var(--glass-blur)',
            border: 'var(--glass-border)',
            boxShadow: 'var(--shadow-md)'
          },
          duration: 3000
        }}
      />
    </Router>
  );
}

export default App;
