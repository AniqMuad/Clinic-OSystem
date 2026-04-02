import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogout } from "@workspace/api-client-react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Package,
  CreditCard,
  Droplets,
  MessageSquare,
  BarChart3,
  BookOpen,
  Settings,
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["admin", "dentist", "assistant", "front_desk"] },
  { name: "Patients", href: "/patients", icon: <Users className="h-5 w-5" />, roles: ["admin", "dentist", "front_desk"] },
  { name: "Appointments", href: "/appointments", icon: <Calendar className="h-5 w-5" />, roles: ["admin", "dentist", "front_desk"] },
  { name: "Tasks", href: "/tasks", icon: <CheckSquare className="h-5 w-5" />, roles: ["admin", "dentist", "assistant"] },
  { name: "Inventory", href: "/inventory", icon: <Package className="h-5 w-5" />, roles: ["admin", "assistant"] },
  { name: "Billing", href: "/billing", icon: <CreditCard className="h-5 w-5" />, roles: ["admin", "dentist", "front_desk"] },
  { name: "Sterilization", href: "/sterilization", icon: <Droplets className="h-5 w-5" />, roles: ["admin", "assistant"] },
  { name: "Chat", href: "/chat", icon: <MessageSquare className="h-5 w-5" />, roles: ["admin", "dentist", "assistant", "front_desk"] },
  { name: "Analytics", href: "/analytics", icon: <BarChart3 className="h-5 w-5" />, roles: ["admin"] },
  { name: "SOP", href: "/sop", icon: <BookOpen className="h-5 w-5" />, roles: ["admin", "dentist", "assistant"] },
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" />, roles: ["admin"] },
];

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const logoutMutation = useLogout();

  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    setLocation("/login");
  };

  const filteredNav = navItems.filter((item) => item.roles.includes(user.role));

  const NavLinks = () => (
    <>
      <div className="flex-1 py-4">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {filteredNav.map((item) => {
            const isActive = location.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout} data-testid="button-logout">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="grid min-h-[100dvh] w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <span className="text-xl">SmileCare OS</span>
            </Link>
          </div>
          <NavLinks />
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-72">
              <div className="flex h-14 items-center border-b px-6">
                <span className="font-semibold text-primary text-xl">SmileCare OS</span>
              </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <span className="font-semibold truncate">
            {filteredNav.find(n => location.startsWith(n.href))?.name || "Dashboard"}
          </span>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
