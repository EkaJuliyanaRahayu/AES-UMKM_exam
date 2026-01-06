import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import api from "./api/axios";

import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrderPage from "./pages/OrderPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminFinancePage from "./pages/admin/AdminFinancePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {

  // 🔥 BUKTI FRONTEND ↔ BACKEND
  useEffect(() => {
    console.log("MENGAMBIL DATA KE BACKEND...");

   api.get("/api/products") 
      .then((res) => {
        console.log("DATA PRODUCTS DARI BACKEND:", res.data);
      })
      .catch((err) => {
        console.error("ERROR API:", err);
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produk" element={<ProductsPage />} />
            <Route path="/produk/:id" element={<ProductDetailPage />} />
            <Route path="/pesan" element={<OrderPage />} />
            <Route path="/tentang" element={<AboutPage />} />
            <Route path="/kontak" element={<ContactPage />} />
            <Route path="/admin" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/produk" element={<AdminProductsPage />} />
            <Route path="/admin/pesanan" element={<AdminOrdersPage />} />
            <Route path="/admin/keuangan" element={<AdminFinancePage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
