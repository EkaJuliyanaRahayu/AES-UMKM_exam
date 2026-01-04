import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
// GANTI IMPORT:
import { fetchOrders, deleteOrder, updateOrderStatus, getOrderStatus, type Order } from '@/api/orders';
import { toast } from '@/hooks/use-toast';
import { Eye, Lock, Search, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [localStatusUpdates, setLocalStatusUpdates] = useState<Record<string, Order['status']>>({});

  // Load orders dari API
  useEffect(() => {
    loadOrders();
    // Load local status changes
    const stored = JSON.parse(localStorage.getItem('orderStatusChanges') || '{}');
    setLocalStatusUpdates(stored);
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error: any) {
      toast({
        title: 'Gagal memuat pesanan',
        description: error.message || 'Terjadi kesalahan saat mengambil data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCombinedStatus = (order: Order): Order['status'] => {
  // Prioritas: 1. dari API (order.status), 2. dari localStorage fallback
  return order.status || localStatusUpdates[order._id] || 'pending';
};

  const filteredOrders = orders.filter((order) => {
    const currentStatus = getCombinedStatus(order);
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || currentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  }).reverse();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'processing': return 'Diproses';
      case 'delivered': return 'Dikirim';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-warning/10 text-warning';
      case 'confirmed': return 'bg-primary/10 text-primary';
      case 'processing': return 'bg-blue-500/10 text-blue-500';
      case 'delivered': return 'bg-success/10 text-success';
      case 'cancelled': return 'bg-destructive/10 text-destructive';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
  try {
    console.log('🔄 [1] Mengubah status order:', orderId, '→', newStatus);
    
    // ✅ 1. Update ke backend via API
    console.log('📡 [2] Memanggil API updateOrderStatus...');
    const updatedOrder = await updateOrderStatus(orderId, newStatus);
    console.log('✅ [3] API Sukses! Response:', updatedOrder);
    
    // ✅ 2. HAPUS dari localStorage (karena sudah tersimpan di DB)
    console.log('🧹 [4] Membersihkan localStorage untuk order:', orderId);
    const updatedLocalStatus = { ...localStatusUpdates };
    delete updatedLocalStatus[orderId]; // 🔥 HAPUS, bukan tambah!
    setLocalStatusUpdates(updatedLocalStatus);
    localStorage.setItem('orderStatusChanges', JSON.stringify(updatedLocalStatus));
    
    // ✅ 3. Update state `orders` dengan data terbaru
    console.log('🔄 [5] Memperbarui state orders...');
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() }
          : order
      )
    );
    
    // ✅ 4. Tampilkan toast sukses
    toast({ 
      title: '✅ Status berhasil diperbarui',
      description: `Status pesanan diubah menjadi "${getStatusLabel(newStatus)}"`,
    });
    
    console.log('🎉 [6] Semua proses selesai!');
    
  } catch (error: any) {
    console.error('❌ [ERROR] Gagal mengubah status:', error);
    
    // ✅ FALLBACK HANYA JIKA API ERROR
    const updatedLocalStatus = { ...localStatusUpdates, [orderId]: newStatus };
    setLocalStatusUpdates(updatedLocalStatus);
    localStorage.setItem('orderStatusChanges', JSON.stringify(updatedLocalStatus));
    
    toast({
      title: '⚠️ Status disimpan sementara',
      description: 'Perubahan disimpan di browser. Silakan coba lagi nanti.',
      variant: 'default'
    });
  }
};

const handleDeleteOrder = async (orderId: string) => {
  if (!confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) return;
  
  try {
    await deleteOrder(orderId);
    toast({ title: 'Pesanan berhasil dihapus' });
    await loadOrders(); // Refresh list
  } catch (error: any) {
    toast({
      title: 'Gagal menghapus pesanan',
      description: error.message || 'Terjadi kesalahan',
      variant: 'destructive'
    });
  }
};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Manajemen Pesanan</h1>
            <p className="text-muted-foreground">
              Total: {orders.length} pesanan • Filter: {filteredOrders.length}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadOrders} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            {/* Warning jika ada local changes */}
            {Object.keys(localStatusUpdates).length > 0 && (
              <div className="relative">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full"></span>
              </div>
            )}
          </div>
        </div>

        {/* Warning tentang status update */}
        {Object.keys(localStatusUpdates).length > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h4 className="font-semibold text-warning">Perubahan Status Sementara</h4>
                <p className="text-sm text-muted-foreground">
                  Ada {Object.keys(localStatusUpdates).length} perubahan status yang hanya tersimpan di browser.
                  Hubungi developer backend untuk menambahkan endpoint update order.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Encryption Notice */}
        <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-success mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground">Data Terenkripsi AES-256</h4>
            <p className="text-sm text-muted-foreground">
              Semua data sensitif pelanggan tersimpan dalam bentuk terenkripsi.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Cari berdasarkan ID, nama pelanggan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="delivered">Dikirim</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        <div className="bg-card rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">ID Pesanan</th>
                  <th className="text-left p-4 font-medium">Pelanggan</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Tanggal</th>
                  <th className="text-left p-4 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const currentStatus = getCombinedStatus(order);
                  return (
                    <tr key={order._id} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4 font-mono text-sm">
                        #{order.orderNumber || order._id.slice(0, 8)}
                      </td>
                      <td className="p-4">{order.customerName}</td>
                      <td className="p-4 font-medium">{formatPrice(order.totalPrice)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Select
                            value={currentStatus}
                            onValueChange={(value: Order['status']) => 
                              handleStatusChange(order._id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                                {getStatusLabel(currentStatus)}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
                              <SelectItem value="processing">Diproses</SelectItem>
                              <SelectItem value="delivered">Dikirim</SelectItem>
                              <SelectItem value="cancelled">Dibatalkan</SelectItem>
                            </SelectContent>
                          </Select>
                          {localStatusUpdates[order._id] && (
                            <span className="text-xs text-warning" title="Perubahan lokal">
                              ⚠️
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                            title="Lihat detail"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Hapus pesanan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && !isLoading && (
            <div className="p-12 text-center text-muted-foreground">
              {searchQuery || filterStatus !== 'all' 
                ? 'Tidak ada pesanan yang sesuai' 
                : 'Belum ada pesanan'
              }
            </div>
          )}
        </div>

        {/* Stats */}
        {orders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{orders.length}</p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Menunggu</p>
              <p className="text-2xl font-bold text-warning">
                {orders.filter(o => getCombinedStatus(o) === 'pending').length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Dikonfirmasi</p>
              <p className="text-2xl font-bold text-primary">
                {orders.filter(o => getCombinedStatus(o) === 'confirmed').length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Dikirim</p>
              <p className="text-2xl font-bold text-success">
                {orders.filter(o => getCombinedStatus(o) === 'delivered').length}
              </p>
            </div>
            <div className="bg-card rounded-xl p-4 text-center">
              <p className="text-sm text-muted-foreground">Dibatalkan</p>
              <p className="text-2xl font-bold text-destructive">
                {orders.filter(o => getCombinedStatus(o) === 'cancelled').length}
              </p>
            </div>
          </div>
        )}

        {/* Order Detail Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                Detail Pesanan #{selectedOrder?.orderNumber || selectedOrder?._id?.slice(0, 8)}
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pelanggan</p>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className={`font-medium ${getStatusColor(getCombinedStatus(selectedOrder))}`}>
                      {getStatusLabel(getCombinedStatus(selectedOrder))}
                      {localStatusUpdates[selectedOrder._id] && ' (perubahan lokal)'}
                    </p>
                  </div>
                </div>
                
                {selectedOrder.customerPhone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Telepon</p>
                    <p className="font-medium">{selectedOrder.customerPhone}</p>
                  </div>
                )}
                
                {selectedOrder.customerAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Alamat</p>
                    <p className="font-medium">{selectedOrder.customerAddress}</p>
                  </div>
                )}
                
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Catatan</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName || item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    )) || (
                      <p className="text-muted-foreground text-center py-4">Tidak ada item</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between pt-4 border-t border-border">
                  <span className="font-medium">Total</span>
                  <span className="font-display text-xl font-bold text-accent">
                    {formatPrice(selectedOrder.totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}