import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
// GANTI IMPORT INI:
import { fetchProductById, fetchProducts, type Product } from '@/api/products';
import { ArrowLeft, ShoppingCart, Minus, Plus, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const IMAGE_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Load product detail
  useEffect(() => {
    if (!id) return;
    
    const loadProduct = async () => {
      setIsLoading(true);
      try {
        // Coba fetch single product by ID
        const productData = await fetchProductById(id);
        setProduct(productData);
        
        // Load related products (same category)
        try {
          const allProducts = await fetchProducts();
          const related = allProducts
            .filter(p => 
              p.category === productData.category && 
              (p._id !== productData._id && p._id !== productData._id)
            )
            .slice(0, 4);
          setRelatedProducts(related);
        } catch (error) {
          console.warn('Gagal load related products:', error);
        }
      } catch (error: any) {
        console.error('Error loading product:', error);
        toast({
          title: 'Gagal memuat produk',
          description: error.message || 'Produk tidak ditemukan',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleOrder = () => {
    if (!product) return;
    const productId = product._id || product._id;
    if (productId) {
      navigate(`/pesan?product=${productId}&quantity=${quantity}`);
    }
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQuantity = Math.max(1, quantity + delta);
    setQuantity(Math.min(newQuantity, product.stock || 0));
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Memuat produk...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-2xl font-bold mb-4">Produk tidak ditemukan</h1>
            <p className="text-muted-foreground mb-6">Produk yang Anda cari mungkin telah dihapus atau tidak tersedia.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/produk">
                <Button variant="outline">Lihat Semua Produk</Button>
              </Link>
              <Link to="/">
                <Button>Kembali ke Beranda</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const isOutOfStock = (product.stock || 0) === 0;
  const maxQuantity = product.stock || 0;

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link 
            to="/produk" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Produk
          </Link>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-card">
              {product.image ? (
                <img
                 src={product.image?.startsWith('/uploads') ? `${IMAGE_BASE}${product.image}` : product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-product.jpg';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-center p-8">
                    <div className="text-4xl mb-4">🍰</div>
                    <p className="text-muted-foreground">Gambar tidak tersedia</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              {/* Category & Stock */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-accent font-medium px-3 py-1 bg-accent/10 rounded-full">
                  {product.category}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  maxQuantity > 10
                    ? 'bg-success/10 text-success'
                    : maxQuantity > 0
                    ? 'bg-warning/10 text-warning'
                    : 'bg-destructive/10 text-destructive'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {isOutOfStock ? 'Habis' : `${maxQuantity} tersedia`}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>

              {/* Description */}
              <div className="prose prose-gray dark:prose-invert max-w-none mb-6">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.description || 'Tidak ada deskripsi tersedia.'}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="font-display text-3xl font-bold text-accent">
                  {formatPrice(product.price)}
                </span>
                <span className="text-muted-foreground">per item</span>
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="mb-8">
                  <label className="block text-sm font-medium mb-3">Pilih Jumlah</label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center border-2 border-input rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-3 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={quantity >= maxQuantity}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-display text-xl font-bold text-foreground">
                        {formatPrice(product.price * quantity)}
                      </p>
                    </div>
                  </div>
                  {maxQuantity <= 5 && (
                    <p className="text-sm text-warning mt-2">
                      ⚠️ Hanya {maxQuantity} stok tersisa!
                    </p>
                  )}
                </div>
              )}

              {/* Order Button */}
              <Button
                variant="accent"
                size="xl"
                className="w-full gap-3 h-14 text-lg"
                onClick={handleOrder}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="w-5 h-5" />
                {isOutOfStock ? 'Stok Habis' : 'Pesan Sekarang'}
              </Button>

              {isOutOfStock && (
                <p className="text-center text-muted-foreground mt-4">
                  Produk ini sedang tidak tersedia. Silakan cek kembali nanti.
                </p>
              )}
            </div>
          </div>

          

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-border">
            <h3 className="font-display text-xl font-bold mb-4">Informasi Tambahan</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium mb-2">🕒 Waktu Pengolahan</h4>
                <p className="text-sm text-muted-foreground">
                  Pesanan diproses dalam 1-2 hari kerja setelah konfirmasi pembayaran.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium mb-2">🚚 Pengiriman</h4>
                <p className="text-sm text-muted-foreground">
                  Gratis ongkir untuk area tertentu. Estimasi pengiriman 2-4 hari.
                </p>
              </div>
              <div className="bg-muted/30 rounded-xl p-4">
                <h4 className="font-medium mb-2">📞 Bantuan</h4>
                <p className="text-sm text-muted-foreground">
                  Butuh bantuan? Hubungi kami di WhatsApp: 08XXXXXXXXXX
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}