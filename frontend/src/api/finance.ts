// 📁 src/api/finance.ts
import axios from "./axios";

export interface FinanceData {
  _id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  orderId?: string;
}


// ✅ GET semua finance records
export const fetchFinance = async (): Promise<FinanceData[]> => {
  const res = await axios.get("/finance");
  return res.data;
};


// ✅ GET finance record by ID
export const fetchFinanceById = async (id: string): Promise<FinanceData> => {
  const response = await axios.get(`/finance/${id}`);
  return response.data;
};

// ✅ CREATE finance record (digunakan di OrderPage dan AdminFinancePage)
export const createFinance = async (data): Promise<{ success: boolean }> => {
  const response = await axios.post("/finance", data);
  return response.data;
};


// ✅ UPDATE finance record
export const updateFinance = async (id: string, data: Partial<FinanceData>): Promise<FinanceData> => {
  const response = await axios.put(`/finance/${id}`, data);
  return response.data;
};

// ✅ DELETE finance record
export const removeFinance = async (id: string): Promise<void> => {
  await axios.delete(`/finance/${id}`);
};


// ✅ Fungsi khusus untuk create financial record dari order (Income)
export const createFinancialRecord = async (data): Promise<{ success: boolean }> => {
  const response = await axios.post("/finance", data);
  return response.data;
};


// ✅ React Query Hooks (opsional, untuk yang mau pakai)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const FINANCE_QUERY_KEY = ["finance"];

export const useFinance = () => {
  return useQuery({
    queryKey: FINANCE_QUERY_KEY,
    queryFn: fetchFinance,
  });
};

export const useCreateFinance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
    },
  });
};

export const useDeleteFinance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: removeFinance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FINANCE_QUERY_KEY });
    },
  });
};

