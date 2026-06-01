import { AnnouncementBar } from '@/components/AnnouncementBar';
import { CartButton } from '@/components/CartButton';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { LaundryServices } from '@/components/LaundryServices';
import { ProductCatalog } from '@/components/ProductCatalog';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home">
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <ProductCatalog />
        <LaundryServices />
      </main>
      <Footer />
      <CartButton variant="float" />
    </div>
  );
}
