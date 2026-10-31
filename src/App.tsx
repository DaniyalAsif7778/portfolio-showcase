import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import Index from "./pages/Index";
import SEO from "@/components/SEO";

const ProjectDetail = lazy(() => import("./pages/ProjectDetail"));
const Profiles = lazy(() => import("./pages/Profiles"));
const Contact = lazy(() => import("./pages/Contact"));
const Admin = lazy(() => import("./pages/Admin"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="portfolio-theme">
        <Toaster />
        <Sonner />
        <Analytics />
        <BrowserRouter>
          <Suspense fallback={<div className="grid min-h-screen place-items-center" role="status" aria-live="polite">Loading page…</div>}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<Navigate to="/#about" replace />} />
              <Route path="/skills" element={<Navigate to="/#skills" replace />} />
              <Route path="/projects" element={<Navigate to="/#projects" replace />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/profiles" element={<Profiles />} />
              <Route path="/github" element={<Navigate to="/profiles" replace />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin-panel" element={<><SEO title="Portfolio Admin" description="Portfolio content administration." noIndex /><Admin /></>} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
