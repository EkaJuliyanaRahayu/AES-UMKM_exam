import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
// GANTI IMPORT INI:
import type { Product } from '@/api/products';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const productId = product._id || product._id || '';
  const isOutOfStock = (product.stock || 0) === 0;
  const isLowStock = (product.stock || 0) > 0 && (product.stock || 0) <= 5;

  return (
    <div className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-up border border-border hover:border-primary/20">
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-muted">
        {product.image ? (
          <img
           src={`http://localhost:5000${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.jpg';
              e.currentTarget.className = 'w-full h-full object-contain p-8';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-8">
              <span className="text-4xl mb-4 block">🍰</span>
              <span className="text-sm text-muted-foreground">No Image</span>
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        {product.category && (
          <div className="absolute top-3 right-3">
            <span className="bg-accent/90 text-accent-foreground text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              {product.category}
            </span>
          </div>
        )}
        
        {/* Stock Badges */}
        {isLowStock && (
          <div className="absolute top-3 left-3">
            <span className="bg-warning/90 text-warning-foreground text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
              Stok {product.stock}
            </span>
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
              Habis
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
          {product.description || 'Tidak ada deskripsi'}
        </p>
        
        {/* Stock Indicator */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                isOutOfStock ? 'bg-destructive' :
                isLowStock ? 'bg-warning' : 
                'bg-success'
              }`}
              style={{ 
                width: isOutOfStock ? '0%' : 
                isLowStock ? '40%' : '100%' 
              }}
            />
          </div>
          <span className={`text-xs font-medium ${
            isOutOfStock ? 'text-destructive' :
            isLowStock ? 'text-warning' : 
            'text-success'
          }`}>
            {isOutOfStock ? 'Habis' : 
             isLowStock ? 'Terbatas' : 'Tersedia'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-xl font-bold text-[#E87555] block"> {formatPrice(product.price)}
            </span>
            <span className="text-xs text-muted-foreground">
              per item
            </span>
          </div>
          
          <Link to={`/produk/${productId}`}>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2" 
              disabled={isOutOfStock}
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Habis' : 'Pesan'}
            </Button>
          </Link>
        </div>

        {/* Quick Actions (Hover) */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <Link to={`/produk/${productId}`} className="flex-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs"
              >
                Detail
              </Button>
            </Link>
            {!isOutOfStock && (
              <Link to={`/pesan?product=${productId}&quantity=1`} className="flex-1">
                <Button 
                  size="sm" 
                  className="w-full text-xs"
                >
                  Beli Langsung
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}