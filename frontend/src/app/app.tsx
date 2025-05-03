import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/shared/styles/index.css";
import router from "./router";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "../shared/providers/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "../shared/api/query-client";
import { Toaster } from "@/shared/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
