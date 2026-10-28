import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { Shield, Lock, Mail, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/i18n";
import { AppHeader } from "@/components/layout/AppHeader";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login, loginAsDemo } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("demo@cracklife.ai");
  const [password, setPassword] = useState("CrackLife2026!");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Failed to log in. Please check credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await loginAsDemo();
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Could not log in as demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      <AppHeader />

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-border/80">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground mb-2">
              <Shield className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">Inspector Portal Login</CardTitle>
            <CardDescription className="text-xs">
              Access your building inspections, comparative analytics, and PDF dossiers
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="inspector@structural-lab.org"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-xs font-semibold h-9" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Sign In to Workspace"}
              </Button>

              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-mono">Quick Access</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full text-xs h-9 gap-2 border-primary/30 text-primary hover:bg-primary/5"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                <UserCheck className="h-4 w-4" /> 1-Click Demo Inspector Login
              </Button>
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-3 text-[11px] text-muted-foreground bg-muted/20">
              <span>Don't have an account?</span>
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Register as Inspector
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        CrackLife AI • Civil Engineering Health Diagnostics
      </footer>
    </div>
  );
}
