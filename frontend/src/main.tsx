import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// IMPORT React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// bikin client
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
