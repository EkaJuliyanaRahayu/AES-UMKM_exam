import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
// GANTI IMPORT INI:
import { fetchAvailableProducts } from '@/api/products'; // Untuk ambil produk
import { createOrder } from '@/api/orders'; // Untuk create order
import { createFinancialRecord } from '@/api/finance'; // Untuk buat record keuangan
import { toast } from '@/hooks/use-toast';
import { Shield, Lock, Minus, Plus, Trash2, Loader2 } from 'lucide-react';

// Interface untuk OrderItem (simplified)
interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Interface untuk Product
interface Product {
  _id: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
}

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // State untuk products
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Load products dari API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await fetchAvailableProducts();
      setProducts(data);
    } catch (error: any) {
      toast({
        title: 'Gagal memuat produk',
        description: error.message || 'Terjadi kesalahan saat mengambil data produk',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Initialize cart from URL params
  useEffect(() => {
    if (products.length === 0) return;
    
    const productId = searchParams.get('product');
    const quantity = parseInt(searchParams.get('quantity') || '1');
    
    if (productId) {
      const product = products.find((p) => p._id === productId || p.id === productId);
      if (product) {
        setCart([{
          productId: product._id || product.id || '',
          productName: product.name,
          quantity,
          price: product.price,
        }]);
      }
    }
  }, [searchParams, products]);

  

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addToCart = (productId: string) => {
    const product = products.find((p) => p._id === productId || p.id === productId);
    if (!product) return;

    const existing = cart.find((item) => item.productId === productId);
    if (existing) {
      setCart(cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product._id || product.id || '',
        productName: product.name,
        quantity: 1,
        price: product.price,
      }]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map((item) => {
      if (item.productId === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) {
      toast({
        title: 'Keranjang kosong',
        description: 'Silakan pilih produk terlebih dahulu',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.customerName || !formData.customerPhone || !formData.customerAddress) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon lengkapi semua data yang diperlukan',
        variant: 'destructive',
      });
      return;
    }

    // Cek stok produk
    for (const item of cart) {
      const product = products.find(p => (p._id || p.id) === item.productId);
      if (!product) {
        toast({
          title: 'Produk tidak ditemukan',
          description: `Produk "${item.productName}" tidak tersedia`,
          variant: 'destructive',
        });
        return;
      }
      if (product.stock < item.quantity) {
        toast({
          title: 'Stok tidak mencukupi',
          description: `Stok "${item.productName}" hanya ${product.stock} unit`,
          variant: 'destructive',
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Create order di database
      const orderData = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: cart,
        totalPrice,
        notes: formData.notes,
        status: 'pending' as const,
        paymentMethod,
        paymentStatus: 'pending' as const,
      };

      const order = await createOrder(orderData);

      // 2. Create financial record (income) - OPSIONAL, jika endpoint tersedia
      try {
        await createFinancialRecord({
          type: 'income',
          amount: totalPrice,
          description: `Pesanan #${order.orderNumber || order._id?.slice(0, 8)} - ${formData.customerName}`,
          category: 'Penjualan',
          date: new Date().toISOString(),
          orderId: order._id,
        });
      } catch (financeError) {
        console.warn('Gagal membuat record keuangan:', financeError);
        // Lanjutkan saja, tidak perlu block order
      }

      toast({
        title: 'Pesanan berhasil!',
        description: `Pesanan Anda telah dibuat.${order.orderNumber ? ` Nomor pesanan: ${order.orderNumber}` : ''}`,
      });

      // Reset form
      setFormData({
        customerName: '',
        customerPhone: '',
        customerAddress: '',
        notes: '',
      });
      setCart([]);
      setPaymentMethod('transfer');
      
      // Redirect ke halaman sukses atau home
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error: any) {
      console.error('Order error:', error);
      toast({
        title: 'Gagal membuat pesanan',
        description: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProducts) {
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

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-accent font-medium mb-2 block">Pemesanan</span>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Pesan Kue
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Lengkapi form pemesanan di bawah ini. Data Anda akan diamankan dengan enkripsi AES-256.
            </p>
          </div>

          {/* Encryption Notice */}
          <div className="bg-success/10 border border-success/20 rounded-xl p-4 mb-8 flex items-start gap-3">
            <Shield className="w-5 h-5 text-success mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground">Data Aman dengan Enkripsi AES</h4>
              <p className="text-sm text-muted-foreground">
                Semua data sensitif pelanggan (nama, telepon, alamat) akan dienkripsi menggunakan algoritma AES-256 sebelum disimpan.
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cart Section */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Keranjang Belanja</h2>
              
              {/* Add Products */}
              <div className="mb-4">
                <Label className="mb-2 block">Tambah Produk</Label>
                <select
                  className="w-full h-11 rounded-lg border-2 border-input bg-background px-4 py-2"
                  onChange={(e) => {
                    if (e.target.value) addToCart(e.target.value);
                    e.target.value = '';
                  }}
                  defaultValue=""
                  disabled={products.length === 0 || isSubmitting}
                >
                  <option value="" disabled>
                    {products.length === 0 ? 'Produk sedang dimuat...' : 'Pilih produk...'}
                  </option>
                  {products.map((product) => (
                    <option 
                      key={product._id || product.id} 
                      value={product._id || product.id}
                      disabled={product.stock === 0}
                    >
                      {product.name} - {formatPrice(product.price)} 
                      {product.stock === 0 ? ' (Habis)' : ` (Stok: ${product.stock})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 bg-muted/50 rounded-xl">
                    <p className="text-muted-foreground">Keranjang belanja kosong</p>
                    {products.length === 0 && (
                      <p className="text-sm text-destructive mt-2">Tidak ada produk yang tersedia</p>
                    )}
                  </div>
                ) : (
                  cart.map((item) => {
                    const product = products.find(p => 
                      (p._id || p.id) === item.productId
                    );
                    const isOutOfStock = product && product.stock < item.quantity;
                    
                    return (
                      <div 
                        key={item.productId} 
                        className={`flex items-center gap-4 bg-card p-4 rounded-xl shadow-card border ${
                          isOutOfStock ? 'border-destructive' : 'border-border'
                        }`}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                          {isOutOfStock && (
                            <p className="text-xs text-destructive mt-1">
                              ⚠️ Stok tidak cukup! Stok tersedia: {product.stock}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="p-1 hover:bg-muted rounded disabled:opacity-50"
                            disabled={item.quantity <= 1 || isSubmitting}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="p-1 hover:bg-muted rounded disabled:opacity-50"
                            disabled={product && (product.stock <= item.quantity || isSubmitting)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-medium w-24 text-right">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.productId)}
                          className="p-2 hover:bg-destructive/10 rounded text-destructive disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total */}
              {cart.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-[#000000] rounded-xl border border-border">
                  <div>
                    <span className="font-bold text-white ">Total</span>
                    {cart.some(item => {
                      const product = products.find(p => (p._id || p.id) === item.productId);
                      return product && product.stock < item.quantity;
                    }) && (
                      <p className="text-xs text-destructive mt-1">
                        ⚠️ Ada produk dengan stok tidak cukup
                      </p>
                    )}
                  </div>
                  <span className="font-display text-2xl font-bold text-accent">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Order Form */}
            <div>
              <h2 className="font-display text-xl font-semibold mb-4">Data Pemesan</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nama Lengkap *</Label>
                  <Input
                    id="name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Masukkan nama lengkap"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Nomor Telepon *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Alamat Pengiriman *</Label>
                  <Textarea
                    id="address"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    placeholder="Masukkan alamat lengkap pengiriman"
                    rows={3}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Catatan (opsional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Catatan tambahan untuk pesanan"
                    rows={2}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <Label>Metode Pembayaran *</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'transfer' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary"
                        disabled={isSubmitting}
                      />
                      <span>Transfer Bank</span>
                    </label>
                    <label className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="text-primary"
                        disabled={isSubmitting}
                      />
                      <span>COD (Bayar di Tempat)</span>
                    </label>
                  </div>
                </div>


                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full"
                  disabled={
                    isSubmitting || 
                    cart.length === 0 || 
                    products.length === 0 ||
                    cart.some(item => {
                      const product = products.find(p => (p._id || p.id) === item.productId);
                      return !product || product.stock < item.quantity;
                    })
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses Pesanan...
                    </>
                  ) : (
                    'Konfirmasi Pesanan'
                  )}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  Dengan mengkonfirmasi pesanan, Anda menyetujui{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    syarat dan ketentuan
                  </a>{' '}
                  kami.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}