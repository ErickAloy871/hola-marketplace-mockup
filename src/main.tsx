import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { MessagesProvider } from "@/context/MessagesContext";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <MessagesProvider>
          <App />
          <Toaster />
        </MessagesProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);
