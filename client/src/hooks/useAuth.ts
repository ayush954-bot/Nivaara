import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface StaffUser {
  id: number;
  username: string;
  name: string;
  role: "property_manager";
  type: "staff";
}

interface AdminUser {
  id: number;
  name: string | null;
  email: string | null;
  role: "admin" | "user";
  type: "admin";
}

export type AuthUser = StaffUser | AdminUser;

export function useAuth() {
  const { data: adminUser, isLoading: adminLoading } = trpc.auth.me.useQuery();
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [staffLoading, setStaffLoading] = useState(true);

  // Check staff authentication
  useEffect(() => {
    fetch("/api/staff/me")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return null;
      })
      .then((data) => {
        if (data) {
          setStaffUser({ ...data, type: "staff" });
        }
        setStaffLoading(false);
      })
      .catch(() => {
        setStaffLoading(false);
      });
  }, []);

  const isLoading = adminLoading || staffLoading;

  // Return staff user if authenticated, otherwise admin user
  const user: AuthUser | null = staffUser
    ? staffUser
    : adminUser
    ? { ...adminUser, type: "admin" as const }
    : null;

  const isAdmin = user?.role === "admin";
  const isPropertyManager = user?.role === "property_manager";
  const canManageProperties = isAdmin || isPropertyManager;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin,
    isPropertyManager,
    canManageProperties,
  };
}
