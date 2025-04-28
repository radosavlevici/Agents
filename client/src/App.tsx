import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// Lazy load the quantum terminal screens to improve initial load time
import { lazy, Suspense } from "react";
const SecurityServices = lazy(() => import("@/pages/SecurityServices"));
const SecurityScans = lazy(() => import("@/pages/SecurityScans"));
const SecurityAlerts = lazy(() => import("@/pages/SecurityAlerts"));
const SecurityReports = lazy(() => import("@/pages/SecurityReports"));
const TerminalSettings = lazy(() => import("@/pages/TerminalSettings"));

function Router() {
  return (
    <Suspense fallback={<div className="bg-terminal-bg min-h-screen flex items-center justify-center">
      <div className="text-terminal-green text-xl">Loading quantum systems...</div>
    </div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/services" component={SecurityServices} />
        <Route path="/scans" component={SecurityScans} />
        <Route path="/alerts" component={SecurityAlerts} />
        <Route path="/reports" component={SecurityReports} />
        <Route path="/settings" component={TerminalSettings} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
