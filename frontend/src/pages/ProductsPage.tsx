import { useState, useMemo } from 'react';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
// GANTI IMPORT INI:
import { fetchProducts, type Product } from "@/api/products";
import { useQuery } from "@tanstack/react-query";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Loader2 } from 'lucide-react';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // GANTI INI: fetchProducts bukan getAllProducts
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  

  const categories: string[] = useMemo(() => {
    const cats = new Set<string>();

    products.forEach((p: Product) => {
      if (typeof p.category === "string" && p.category.trim()) {
        cats.add(p.category);
      }
    });

    return Array.from(cats);
  }, [products]);

 // LINE 34-40 (ganti dengan ini):
const filteredProducts = useMemo(() => {
  // Safety first
  if (!products || !Array.isArray(products)) return [];
  
  return products.filter((product: Product) => {
    // Double safety check
    const name = product?.name || '';
    const description = product?.description || '';
    const category = product?.category || '';
    
    // Convert to string dan lowercase
    const nameStr = String(name).toLowerCase();
    const descStr = String(description).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = 
      nameStr.includes(query) || 
      descStr.includes(query);
    
    const matchesCategory = 
      !selectedCategory || 
      String(category) === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
}, [products, searchQuery, selectedCategory]);

  // Loading State
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

  // Error State
  if (isError) {
    return (
      <Layout>
        <div className="min-h-screen py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-xl font-bold text-destructive mb-2">Gagal Memuat Produk</h2>
              <p className="text-muted-foreground mb-6">Terjadi kesalahan saat mengambil data produk</p>
              <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Available products (filter out of stock if needed)
  const availableProducts = filteredProducts; // atau .filter(p => p.stock > 0) jika mau hanya yang ada stok

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-amber-600 font-medium mb-2 block">Katalog</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Produk Kami
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Pilih kue favorit Anda dari berbagai kategori yang kami sediakan
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan nama atau deskripsi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery('')}
                >
                  Clear
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Semua
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Info */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              Menampilkan <span className="font-bold text-foreground">{availableProducts.length}</span> dari{' '}
              <span className="font-bold text-foreground">{products.length}</span> produk
              {searchQuery && ` untuk "${searchQuery}"`}
              {selectedCategory && ` dalam kategori "${selectedCategory}"`}
            </p>
          </div>

          {/* Products Grid */}
          {availableProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {availableProducts.map((product) => (
                <ProductCard key={product._id || product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-xl">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🍰</div>
                <h3 className="text-xl font-semibold mb-2">Produk Tidak Ditemukan</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery 
                    ? `Tidak ada produk yang cocok dengan "${searchQuery}"`
                    : selectedCategory
                    ? `Tidak ada produk dalam kategori "${selectedCategory}"`
                    : 'Belum ada produk yang tersedia'
                  }
                </p>
                <div className="flex gap-3 justify-center">
                  {(searchQuery || selectedCategory) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('');
                      }}
                    >
                      Tampilkan Semua Produk
                    </Button>
                  )}
                  <Button onClick={() => window.location.reload()}>
                    Refresh Halaman
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
}