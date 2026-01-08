import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from "@/api/axios";

import { 
  fetchProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  type Product 
} from '@/api/products';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, X, Search, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    image: '/placeholder.svg',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // ← TAMBAH INI
  const [imagePreview, setImagePreview] = useState<string>(''); // ← TAMBAH INI
  const [isLoading, setIsLoading] = useState(false);

  const IMAGE_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      toast({
        title: 'Gagal memuat produk',
        description: 'Terjadi kesalahan saat mengambil data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      stock: '',
      image: '/placeholder.svg',
    });
    setSelectedFile(null); // ← RESET FILE
    setImagePreview(''); // ← RESET PREVIEW
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      image: product.image || '/placeholder.svg',
    });
    setSelectedFile(null); // ← RESET FILE
    setImagePreview(''); // ← RESET PREVIEW
    setIsDialogOpen(true);
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi file
      if (!file.type.match('image.*')) {
        toast({
          title: 'Format tidak didukung',
          description: 'Hanya file gambar yang diizinkan',
          variant: 'destructive'
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: 'File terlalu besar',
          description: 'Ukuran maksimal 5MB',
          variant: 'destructive'
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Buat preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        // Jangan update formData.image agar tetap compatible dengan mode URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submit - DUAL MODE: FormData (upload) atau JSON (URL)
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    if (selectedFile) {
      // MODE UPLOAD FILE
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("image", selectedFile);

      if (editingProduct && editingProduct._id) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({ title: "Produk berhasil diperbarui" });
      } else {
        await api.post(`/products`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast({ title: "Produk berhasil ditambahkan" });
      }
    } else {
      // MODE URL GAMBAR (tidak diubah, tetap pakai function lama)
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseInt(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        image: formData.image,
      };

      if (editingProduct && editingProduct._id) {
        await updateProduct({ id: editingProduct._id, data: productData });
        toast({ title: "Produk berhasil diperbarui" });
      } else {
        await createProduct(productData);
        toast({ title: "Produk berhasil ditambahkan" });
      }
    }

    await loadProducts();
    setIsDialogOpen(false);
    setSelectedFile(null);
    setImagePreview("");

  } catch (error: any) {
    toast({
      title: "Gagal menyimpan produk",
      description: error.message || "Terjadi kesalahan",
      variant: "destructive",
    });
  }
};


  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      try {
        await deleteProduct(id);
        toast({ title: 'Produk berhasil dihapus' });
        await loadProducts();
      } catch (error: any) {
        toast({
          title: 'Gagal menghapus produk',
          description: error.message || 'Terjadi kesalahan',
          variant: 'destructive'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Memuat produk...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Manajemen Produk</h1>
            <p className="text-muted-foreground">Kelola produk kue Anda</p>
          </div>
          <Button onClick={openAddDialog} className="gap-2">
            <Plus className="w-4 h-4" />
            Tambah Produk
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari produk..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Produk</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Kategori</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Harga</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Stok</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product._id || product._id} className="border-t border-border">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          <img
                              src={
                                product.image?.startsWith("/uploads")
                                  ? `${IMAGE_BASE}${product.image}`
                                  : product.image || "/placeholder.svg"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                              }}
                            />

                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-sm">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 5 ? 'bg-success/10 text-success' :
                        product.stock > 0 ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(product._id || product._id || '')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              {searchQuery ? 'Tidak ada produk ditemukan' : 'Belum ada produk'}
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Gambar Produk - SECTION BARU */}
              <div>
                <Label htmlFor="image">Gambar Produk</Label>
                
                {/* Preview */}
                <div className="mb-3">
                  {(imagePreview || formData.image) && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview || formData.image} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Upload File */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-input')?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {selectedFile ? 'Ganti Gambar' : 'Upload Gambar'}
                    </Button>
                    
                    {selectedFile && (
                      <span className="text-sm text-muted-foreground">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Atau Input URL (backward compatible) */}
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Atau gunakan URL gambar:</p>
                    <Input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      disabled={!!selectedFile}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-1">
                  Ukuran maksimal: 5MB. Format: JPG, PNG, GIF, WebP
                </p>
              </div>

              {/* Nama Produk */}
              <div>
                <Label htmlFor="name">Nama Produk *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Deskripsi */}
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              {/* Harga dan Stok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga (Rp) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stock">Stok *</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Kategori */}
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Kue Tradisional, Kue Modern, dll"
                  required
                />
              </div>

              {/* Tombol */}
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" variant="accent" className="flex-1">
                  {editingProduct ? 'Simpan' : 'Tambah'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}