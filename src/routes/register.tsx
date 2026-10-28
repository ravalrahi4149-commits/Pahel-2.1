import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import React, { useState } from "react";
import { Shield, Lock, Mail, User, Building, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { AppHeader } from "@/components/layout/AppHeader";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [organization, setOrganization] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await register({ email, password, fullName, organization });
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.message || "Registration failed. Try again.");
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
            <CardTitle className="text-xl font-bold tracking-tight">Register Inspector Profile</CardTitle>
            <CardDescription className="text-xs">
              Create an engineering account to monitor structural surfaces and crack patterns
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Eng. Rajesh Patel, P.E."
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="org" className="text-xs">Organization / Diagnostic Lab</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="org"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Apex Civil Forensic Group"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh@apex-civil.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full text-xs font-semibold h-9 mt-2" disabled={isLoading}>
                {isLoading ? "Creating Profile..." : "Complete Registration"}
              </Button>
            </CardContent>

            <CardFooter className="flex justify-between border-t px-6 py-3 text-[11px] text-muted-foreground bg-muted/20">
              <span>Already registered?</span>
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
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
