import { PublicLayout } from "@/components/layout/PublicLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AuthProvider } from "@/lib/auth";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Public pages
import Home from "@/pages/public/Home";
import About from "@/pages/public/About";
import Services from "@/pages/public/Services";
import ServiceDetail from "@/pages/public/ServiceDetail";
import Gallery from "@/pages/public/Gallery";
import Promotions from "@/pages/public/Promotions";
import Contact from "@/pages/public/Contact";
import Book from "@/pages/public/Book";

// Dashboard pages
import Login from "@/pages/dashboard/Login";
import DashboardOverview from "@/pages/dashboard/Overview";
import Patients from "@/pages/dashboard/Patients";
import PatientDetail from "@/pages/dashboard/PatientDetail";
import Appointments from "@/pages/dashboard/Appointments";
import Tasks from "@/pages/dashboard/Tasks";
import Inventory from "@/pages/dashboard/Inventory";
import Billing from "@/pages/dashboard/Billing";
import Sterilization from "@/pages/dashboard/Sterilization";
import Chat from "@/pages/dashboard/Chat";
import Analytics from "@/pages/dashboard/Analytics";
import SOP from "@/pages/dashboard/SOP";
import Settings from "@/pages/dashboard/Settings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/">
        <PublicLayout><Home /></PublicLayout>
      </Route>
      <Route path="/about">
        <PublicLayout><About /></PublicLayout>
      </Route>
      <Route path="/services">
        <PublicLayout><Services /></PublicLayout>
      </Route>
      <Route path="/services/:id">
        {(params) => <PublicLayout><ServiceDetail id={params.id} /></PublicLayout>}
      </Route>
      <Route path="/gallery">
        <PublicLayout><Gallery /></PublicLayout>
      </Route>
      <Route path="/promotions">
        <PublicLayout><Promotions /></PublicLayout>
      </Route>
      <Route path="/contact">
        <PublicLayout><Contact /></PublicLayout>
      </Route>
      <Route path="/book">
        <PublicLayout><Book /></PublicLayout>
      </Route>

      {/* Auth Route */}
      <Route path="/login">
        <Login />
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard">
        <DashboardLayout><DashboardOverview /></DashboardLayout>
      </Route>
      <Route path="/patients">
        <DashboardLayout><Patients /></DashboardLayout>
      </Route>
      <Route path="/patients/:id">
        {(params) => <DashboardLayout><PatientDetail id={params.id} /></DashboardLayout>}
      </Route>
      <Route path="/appointments">
        <DashboardLayout><Appointments /></DashboardLayout>
      </Route>
      <Route path="/tasks">
        <DashboardLayout><Tasks /></DashboardLayout>
      </Route>
      <Route path="/inventory">
        <DashboardLayout><Inventory /></DashboardLayout>
      </Route>
      <Route path="/billing">
        <DashboardLayout><Billing /></DashboardLayout>
      </Route>
      <Route path="/sterilization">
        <DashboardLayout><Sterilization /></DashboardLayout>
      </Route>
      <Route path="/chat">
        <DashboardLayout><Chat /></DashboardLayout>
      </Route>
      <Route path="/analytics">
        <DashboardLayout><Analytics /></DashboardLayout>
      </Route>
      <Route path="/sop">
        <DashboardLayout><SOP /></DashboardLayout>
      </Route>
      <Route path="/settings">
        <DashboardLayout><Settings /></DashboardLayout>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
