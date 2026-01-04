'use client';

import AdminLayout from '@/components/AdminLayout';
import { Package, ShoppingCart, DollarSign, TrendingUp, RefreshCw, AlertTriangle } from 'lucide-react';
import { useDashboardData } from '@/api/dashboard';

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, refetch } = useDashboardData();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Loading State
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Memuat data dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error State
  if (isError || !stats) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="font-semibold text-destructive mb-2">Gagal memuat data dashboard</h3>
            <p className="text-muted-foreground mb-4">Periksa koneksi internet atau hubungi admin</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Pastikan semua data ada (safety check)
  const lowStockProducts = stats.lowStockProducts || [];
  const topProducts = stats.topProducts || [];
  const recentOrders = stats.recentOrders || [];

  return (
  <AdminLayout>
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Selamat datang di panel admin </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Produk */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Produk</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.totalProducts || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Pesanan */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pesanan</p>
              <p className="font-display text-2xl font-bold text-foreground">
                {stats.totalOrders || 0}
              </p>
              {stats.pendingOrders > 0 && (
                <p className="text-xs text-warning mt-1">
                  {stats.pendingOrders} menunggu konfirmasi
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <p className="font-display text-xl font-bold text-foreground">
                {formatPrice(stats.totalIncome || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pendapatan Hari Ini */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <h3 className="font-display font-semibold mb-4">Pendapatan Hari Ini</h3>
        <p className="text-3xl font-bold text-success">
          {formatPrice(stats.todayIncome || 0)}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Recent Orders */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="font-display text-xl font-semibold">Pesanan Terbaru</h2>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">ID Pesanan</th>
                  <th className="text-left p-4 font-medium">Pelanggan</th>
                  <th className="text-left p-4 font-medium">Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => {
                  const orderId = order.id || order.id || `order-${index}`;
                  const displayId = order.id?.slice?.(0, 8) || order.id?.slice?.(0, 8) || 'N/A';
                  
                  return (
                    <tr key={`order-${orderId}`} className="border-t border-border hover:bg-muted/30">
                      <td className="p-4 font-mono text-sm">#{displayId}</td>
                      <td className="p-4">{order.customerName || 'Tidak diketahui'}</td>
                      <td className="p-4 font-medium">{formatPrice(order.totalPrice || 0)}</td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'pending' ? 'bg-warning/10 text-warning' :
                          order.status === 'confirmed' ? 'bg-primary/10 text-primary' :
                          order.status === 'processing' ? 'bg-blue-500/10 text-blue-500' :
                          order.status === 'delivered' ? 'bg-success/10 text-success' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {order.status === 'pending' ? 'Menunggu' :
                           order.status === 'confirmed' ? 'Dikonfirmasi' :
                           order.status === 'processing' ? 'Diproses' :
                           order.status === 'delivered' ? 'Dikirim' : 'Dibatalkan'}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {order.createdAt 
                          ? new Date(order.createdAt).toLocaleDateString('id-ID')
                          : '-'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            Belum ada pesanan
          </div>
        )}
      </div>
    </div>
  </AdminLayout>
);}