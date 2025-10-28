import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Racks from "./pages/Racks";
import Trays from "./pages/Trays";
import Slots from "./pages/Slots";
import Station from "./pages/Station";
import Extremes from "./pages/Extremes";
import ApkLink from "./pages/ApkLink";
import Monitor from "./pages/Monitor";
import Tasks from "./pages/Tasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Home />} />
          <Route path="/racks" element={<Racks />} />
          <Route path="/trays" element={<Trays />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/station" element={<Station />} />
          <Route path="/extremes" element={<Extremes />} />
          <Route path="/apk-link" element={<ApkLink />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/tasks" element={<Tasks />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
