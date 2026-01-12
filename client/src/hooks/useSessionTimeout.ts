import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Hook to handle session timeout for staff users
 * Automatically logs out staff after 30 minutes of inactivity
 */
export function useSessionTimeout(userType: "staff" | "admin" | null) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    // Only apply timeout for staff users
    if (userType !== "staff") {
      return;
    }

    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
    const WARNING_TIME = 28 * 60 * 1000; // Show warning at 28 minutes

    const resetTimeout = () => {
      // Clear existing timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      warningShownRef.current = false;

      // Set warning timeout (2 minutes before expiry)
      warningTimeoutRef.current = setTimeout(() => {
        if (!warningShownRef.current) {
          warningShownRef.current = true;
          toast.warning("Your session will expire in 2 minutes due to inactivity");
        }
      }, WARNING_TIME);

      // Set logout timeout
      timeoutRef.current = setTimeout(async () => {
        try {
          await fetch("/api/staff/logout", { method: "POST" });
          toast.error("Session expired. Please login again.");
          // Use window.location for navigation to avoid hook issues
          window.location.href = "/staff/login";
        } catch (error) {
          console.error("Auto-logout failed:", error);
          window.location.href = "/staff/login";
        }
      }, SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => {
      document.addEventListener(event, resetTimeout);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [userType]);
}
