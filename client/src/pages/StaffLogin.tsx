import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, User, AlertCircle, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function StaffLogin() {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (user && !authLoading) {
      setLocation("/admin/dashboard");
    }
  }, [user, authLoading, setLocation]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid username or password");
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard on successful login
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    // Redirect to OAuth login endpoint
    window.location.href = "/api/login";
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Staff & Admin Login</CardTitle>
          <CardDescription className="text-center">
            Property Management System
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Manus OAuth Login */}
          <div className="space-y-3">
            <div className="text-center text-sm font-medium text-muted-foreground">
              Admin Login (Manus Account)
            </div>
            <Button 
              onClick={handleOAuthLogin} 
              className="w-full" 
              variant="default"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login with Manus
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with staff credentials
              </span>
            </div>
          </div>

          {/* Staff Credentials Login */}
          <form onSubmit={handleStaffLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="outline" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In as Staff"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>For access issues, contact your administrator</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
