import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
// GANTI IMPORT INI:
import { fetchProducts, type Product } from '@/api/products';
import { ArrowRight, Shield, Truck, Clock, Award, Loader2 } from 'lucide-react';
import heroImage from '@/assets/hero-bakery.jpg';
import { useState, useEffect } from 'react';

const features = [
  {
    icon: Shield,
    color: 'text-success',
    title: 'Keamanan Data',
    description: 'Data pelanggan diamankan dengan enkripsi AES-256',
  },
  {
    icon: Truck,
    color: 'text-chart-2',
    title: 'Pengiriman Cepat',
    description: 'Pengiriman same-day untuk area Jakarta',
  },
  {
    icon: Clock,
    color: 'text-chart-4',
    title: 'Freshly Baked',
    description: 'Kue dibuat fresh setiap hari',
  },
  {
    icon: Award,
    color: 'text-warning',
    title: 'Kualitas Premium',
    description: 'Bahan-bahan berkualitas tinggi',
  },
];

export default function Index() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products dari API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await fetchProducts();
        // Ambil 6 produk pertama yang ada stok
      const availableProducts = data.slice(0, 6); 
        setProducts(availableProducts);
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Gagal memuat produk');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Kue Rumahan"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-block text-[#E87555] font-medium mb-4 animate-fade-up">
              🍰 Selamat Datang di
            </span>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              Aqilah <span className="text-[#E87555]">Cakes</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Nikmati kelezatan kue tradisional dan modern dengan cita rasa autentik rumahan. 
              Dibuat dengan cinta dan bahan-bahan berkualitas tinggi.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <Link to="/produk">
                <Button variant="hero" className="gap-2">
                  Lihat Produk
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/pesan">
                <Button variant="hero-outline">
                  Pesan Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card shadow-card animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className={`w-7 h-7 ${feature.color || 'text-accent-600'}`} />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[#E87555] font-medium mb-2 block">Produk Kami</span>
            <h2 className="font-display text-4xl font-bold text-foreground mb-4">
              Kue Pilihan Terbaik
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Kami menyajikan berbagai pilihan kue tradisional dan modern yang dibuat 
              dengan resep turun-temurun dan bahan-bahan premium.
            </p>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Memuat produk...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Coba Lagi
              </Button>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Belum ada produk yang tersedia</p>
              <Link to="/admin/products">
                <Button variant="outline">Tambah Produk</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <div key={product._id || product._id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link to="/produk">
                  <Button variant="outline" size="lg" className="gap-2">
                    Lihat Semua Produk
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      

      {/* CTA Section */}
      <section className="py-20 bg-[#6B3B1E]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ingin Memesan Kue?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Hubungi kami untuk pemesanan kue custom atau hampers untuk acara spesial Anda.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/pesan">
              <Button variant="accent" size="xl">
                Pesan Sekarang
              </Button>
            </Link>
            <a href="https://wa.me/628XXXXXXXXXX" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="xl" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Chat via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      
    </Layout>
  );
}