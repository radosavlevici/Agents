import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";

// Import pages with correct paths
import SecurityServices from "./pages/SecurityServices";
import SecurityScans from "./pages/SecurityScans";
import SecurityAlerts from "./pages/SecurityAlerts";
import SecurityReports from "./pages/SecurityReports";
import TerminalAssistant from "./pages/TerminalAssistant";
import TerminalSettings from "./pages/TerminalSettings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services" component={SecurityServices} />
      <Route path="/scans" component={SecurityScans} />
      <Route path="/alerts" component={SecurityAlerts} />
      <Route path="/reports" component={SecurityReports} />
      <Route path="/settings" component={TerminalSettings} />
      <Route path="/assistant" component={TerminalAssistant} />
      <Route component={NotFound} />
    </Switch>
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
