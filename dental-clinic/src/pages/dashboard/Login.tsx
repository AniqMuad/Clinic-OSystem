import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Stethoscope } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast({ title: "Please enter both email and password", variant: "destructive" });
    }

    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        login(data.user, data.token);
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Login Failed", description: "Invalid email or password", variant: "destructive" });
      }
    });
  };

  // Provide quick demo logins for testing
  const setDemoCreds = (role: string) => {
    setEmail(`${role}@example.com`);
    setPassword("password123");
  };

  return (
    <div className="min-h-screen w-full flex bg-muted/20">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 text-primary">
              <Stethoscope className="h-8 w-8" />
              <span className="text-2xl font-bold tracking-tight">SmileCare OS</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Clinic operating system for authorized staff only.
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary font-medium hover:underline">Forgot password?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-border">
              <p className="text-xs text-muted-foreground mb-4 text-center">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={() => setDemoCreds("admin")} className="text-xs">Admin</Button>
                <Button variant="outline" size="sm" onClick={() => setDemoCreds("dentist")} className="text-xs">Dentist</Button>
                <Button variant="outline" size="sm" onClick={() => setDemoCreds("assistant")} className="text-xs">Assistant</Button>
                <Button variant="outline" size="sm" onClick={() => setDemoCreds("frontdesk")} className="text-xs">Front Desk</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:block relative w-0 flex-1 bg-primary/10">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold text-primary mb-4">Fast. Purposeful. Reliable.</h2>
            <p className="text-primary/80 text-lg leading-relaxed">
              SmileCare OS is designed to reduce friction in your daily workflow. Everything you need to manage patients, schedules, and clinic operations in one unified interface.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
