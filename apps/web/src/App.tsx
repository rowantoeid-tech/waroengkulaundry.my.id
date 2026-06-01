import { CartProvider, useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { HomePage } from '@/pages/HomePage';
import { CheckoutPage } from '@/pages/CheckoutPage';

function AppRoutes() {
  const { view } = useCart();

  if (view === 'checkout') {
    return <CheckoutPage />;
  }

  return (
    <>
      <HomePage />
      <CartDrawer />
    </>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
