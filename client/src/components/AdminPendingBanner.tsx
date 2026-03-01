import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardList, X } from "lucide-react";

/**
 * AdminPendingBanner
 * Renders a sticky amber banner at the top of any /admin/* page when there are
 * public property/project submissions waiting for review.
 * Visible to both admin users and staff with canManageProperties access.
 * Can be dismissed per-session (reappears on page refresh).
 */
export default function AdminPendingBanner() {
  const [location] = useLocation();
  const [dismissed, setDismissed] = useState(false);
  const { canManageProperties } = useAuth();

  // Only show on admin pages
  const isAdminPage = location.startsWith("/admin");

  // Don't show on the review queue page itself (already showing the list)
  const isReviewQueuePage = location === "/admin/review-queue";

  const { data } = trpc.publicListing.adminListPending.useQuery(undefined, {
    enabled: isAdminPage && canManageProperties && !isReviewQueuePage,
    // Refetch every 60 seconds to stay up-to-date
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const pendingCount =
    (data?.properties?.length ?? 0) + (data?.projects?.length ?? 0);

  if (!isAdminPage || isReviewQueuePage || !canManageProperties || dismissed || pendingCount === 0) {
    return null;
  }

  return (
    <div className="w-full bg-amber-500 text-white px-4 py-2 flex items-center justify-between gap-3 text-sm font-medium shadow-sm">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 shrink-0" />
        <span>
          {pendingCount} public listing{pendingCount !== 1 ? "s" : ""} pending review
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/admin/review-queue"
          className="underline underline-offset-2 hover:no-underline whitespace-nowrap"
        >
          Review now →
        </Link>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="hover:opacity-70 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
