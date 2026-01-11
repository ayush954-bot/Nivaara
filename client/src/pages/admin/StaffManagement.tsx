import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  UserPlus,
  Users,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

interface StaffMember {
  id: number;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function StaffManagement() {
  const { user, isAdmin } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    phone: "",
  });

  // Load staff members (only for admin)
  const loadStaff = async () => {
    try {
      const response = await fetch("/api/staff/list");
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (err) {
      console.error("Failed to load staff:", err);
    }
  };

  // Create new staff member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/staff/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create staff member");
        setLoading(false);
        return;
      }

      setSuccess(`Staff member created successfully! Username: ${formData.username}`);
      setFormData({
        username: "",
        password: "",
        name: "",
        email: "",
        phone: "",
      });
      loadStaff();
      setLoading(false);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  // Deactivate staff member
  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this staff member?")) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/${id}/deactivate`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Staff member deactivated");
        loadStaff();
      }
    } catch (err) {
      setError("Failed to deactivate staff member");
    }
  };

  // Activate staff member
  const handleActivate = async (id: number) => {
    try {
      const response = await fetch(`/api/staff/${id}/activate`, {
        method: "POST",
      });

      if (response.ok) {
        setSuccess("Staff member activated");
        loadStaff();
      }
    } catch (err) {
      setError("Failed to activate staff member");
    }
  };

  // Load staff on mount
  useState(() => {
    if (isAdmin) {
      loadStaff();
    }
  });

  if (!user) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Please sign in to access staff management.
            </p>
            <Button asChild className="w-full">
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-16">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Only the owner can manage staff members.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/admin/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Staff Management
        </h1>
        <p className="text-muted-foreground">
          Manage employee accounts for property management
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Staff Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add New Staff Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  required
                  placeholder="employee_username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    placeholder="Strong password"
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+91 9876543210"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create Staff Member"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Staff List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Current Staff Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No staff members yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {staff.map((member) => (
                  <Card key={member.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            @{member.username}
                          </p>
                          {member.email && (
                            <p className="text-sm text-muted-foreground">
                              {member.email}
                            </p>
                          )}
                          {member.phone && (
                            <p className="text-sm text-muted-foreground">
                              {member.phone}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Created: {new Date(member.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {member.isActive ? (
                            <>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                Active
                              </span>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeactivate(member.id)}
                              >
                                Deactivate
                              </Button>
                            </>
                          ) : (
                            <>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                Inactive
                              </span>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleActivate(member.id)}
                              >
                                Activate
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
