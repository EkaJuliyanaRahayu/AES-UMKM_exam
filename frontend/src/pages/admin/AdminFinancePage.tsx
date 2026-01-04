import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFinance,
  createFinance,
  removeFinance,
  FinanceData,
} from "@/api/finance";

export default function AdminFinancePage() {

  const queryClient = useQueryClient();

  // 📌 Fetching data dari backend
 const { data: records = [] } = useQuery({
  queryKey: ["finance"] as const,
  queryFn: fetchFinance,
});


  // 📌 Add mutation
  const mutationAdd = useMutation({
    mutationFn: createFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] as const });

      toast({ title: "Catatan keuangan berhasil ditambah" });
    },
  });

  // 📌 Delete mutation
  const mutationDelete = useMutation({
    mutationFn: removeFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance"] as const });
      toast({ title: "Catatan berhasil dihapus" });
    },
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  const stats = useMemo(() => {
    const totalIncome = records
      .filter((r) => r.type === "income")
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpense = records
      .filter((r) => r.type === "expense")
      .reduce((sum, r) => sum + r.amount, 0);

    const netProfit = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netProfit };
  }, [records]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    mutationAdd.mutate({
      type: formData.type,
      amount: parseInt(formData.amount),
      description: formData.description,
      category: formData.category,
      date: new Date(formData.date).toISOString(),
    });

    setIsDialogOpen(false);
    setFormData({
      type: "income",
      amount: "",
      description: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Yakin ingin menghapus catatan ini?")) {
      mutationDelete.mutate(id);
    }
  };

  const sortedRecords = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <AdminLayout>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">Keuangan</h1>
          <p className="text-muted-foreground">Catat dan kelola keuangan usaha</p>
        </div>

        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Tambah Catatan
        </Button>
      </div>

      {/* AES notice */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4 flex items-start gap-3 mb-6">
        <Lock className="w-5 h-5 text-success mt-0.5" />
        <div>
          <h4 className="font-semibold text-foreground">Data Terenkripsi</h4>
          <p className="text-sm text-muted-foreground">
            Semua data keuangan kamu tersimpan terenkripsi AES.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {/* pemasukan */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pemasukan</p>
              <p className="font-display text-xl font-bold text-success">
                {formatPrice(stats.totalIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* pengeluaran */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Pengeluaran</p>
              <p className="font-display text-xl font-bold text-destructive">
                {formatPrice(stats.totalExpense)}
              </p>
            </div>
          </div>
        </div>

        {/* Profit */}
        <div className="bg-card rounded-xl p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Laba Bersih</p>
              <p
                className={`font-display text-xl font-bold ${
                  stats.netProfit >= 0 ? "text-success" : "text-destructive"
                }`}
              >
                {formatPrice(stats.netProfit)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-card rounded-xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold">
            Riwayat Transaksi
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              {sortedRecords.map((record) => (
                <tr key={record._id} className="border-t border-border">
                  <td className="p-4">{new Date(record.date).toLocaleDateString("id-ID")}</td>
                  <td className="p-4">{record.type}</td>
                  <td className="p-4">{record.category}</td>
                  <td className="p-4">{record.description}</td>
                  <td className="p-4">{formatPrice(record.amount)}</td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(record._id!)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedRecords.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            Belum ada catatan keuangan
          </div>
        )}
      </div>

      {/* DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              Tambah Catatan Keuangan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <Label>Tipe Transaksi</Label>
              <Select
                value={formData.type}
                onValueChange={(v: "income" | "expense") =>
                  setFormData({ ...formData, type: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Jumlah</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Kategori</Label>
              <Input
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div>
              <Label>Tanggal</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" className="flex-1">
                Tambah
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
    </AdminLayout>
  );
}
