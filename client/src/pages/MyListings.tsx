import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Home,
  Building2,
  MapPin,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Phone,
  Eye,
  Pencil,
  Trash2,
  Tag,
  History,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PhoneOtpVerification from "@/components/PhoneOtpVerification";
import { getFallbackImageUrl } from "@/lib/propertyFallbackImage";

type VerifiedSession = { phone: string; token: string };

function StatusBadge({ status }: { status: string | null }) {
  if (status === "published") {
    return (
      <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Published
      </Badge>
    );
  }
  if (status === "rejected") {
    return (
      <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
        <XCircle className="h-3 w-3 mr-1" />
        Rejected
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
      <Clock className="h-3 w-3 mr-1" />
      Pending Review
    </Badge>
  );
}

// ─── Edit Property Dialog ─────────────────────────────────────────────────────
function EditPropertyDialog({
  prop,
  token,
  open,
  onClose,
  onSuccess,
}: {
  prop: any;
  token: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    title: prop.title ?? "",
    price: String(prop.price ?? ""),
    status: prop.status ?? "Ready",
    description: prop.description ?? "",
  });

  const updateMutation = trpc.publicListing.updateMyProperty.useMutation({
    onSuccess: () => {
      toast.success("Listing updated successfully.");
      onSuccess();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Property Listing</DialogTitle>
          <DialogDescription>Update the details of your property.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Price (₹)</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger className="text-gray-900 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ready">Ready to Move</SelectItem>
                <SelectItem value="Under-Construction">Under Construction</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() =>
              updateMutation.mutate({
                firebaseToken: token,
                id: prop.id,
                title: form.title || undefined,
                price: form.price || undefined,
                status: (form.status as any) || undefined,
                description: form.description || undefined,
              })
            }
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Project Dialog ──────────────────────────────────────────────────────
function EditProjectDialog({
  proj,
  token,
  open,
  onClose,
  onSuccess,
}: {
  proj: any;
  token: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    name: proj.name ?? "",
    builderName: proj.builderName ?? "",
    status: proj.status ?? "Under Construction",
    description: proj.description ?? "",
  });

  const updateMutation = trpc.publicListing.updateMyProject.useMutation({
    onSuccess: () => {
      toast.success("Project listing updated successfully.");
      onSuccess();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Project Listing</DialogTitle>
          <DialogDescription>Update the details of your project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1">
            <Label>Project Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Builder Name</Label>
            <Input
              value={form.builderName}
              onChange={(e) => setForm((f) => ({ ...f, builderName: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger className="text-gray-900 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Under Construction">Under Construction</SelectItem>
                <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                <SelectItem value="Sold Out">Sold Out</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() =>
              updateMutation.mutate({
                firebaseToken: token,
                id: proj.id,
                name: form.name || undefined,
                builderName: form.builderName || undefined,
                status: (form.status as any) || undefined,
                description: form.description || undefined,
              })
            }
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirmation Dialog ───────────────────────────────────────────────
function DeleteConfirmDialog({
  title,
  open,
  onClose,
  onConfirm,
  isPending,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete <strong>{title}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit History Timeline ───────────────────────────────────────────────────
function EditHistoryTimeline({ token, listingType, listingId }: { token: string; listingType: "property" | "project"; listingId: number }) {
  const [open, setOpen] = useState(false);
  const { data: edits, isLoading } = trpc.publicListing.getMyListingEdits.useQuery(
    { firebaseToken: token, listingType, listingId },
    { enabled: open }
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2"
      >
        <History className="h-3.5 w-3.5" />
        View edit history
        <ChevronDown className="h-3 w-3" />
      </button>
    );
  }

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(false)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
      >
        <History className="h-3.5 w-3.5" />
        Hide edit history
        <ChevronUp className="h-3 w-3" />
      </button>
      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading…</p>
      ) : !edits || edits.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No edits recorded yet.</p>
      ) : (
        <div className="relative pl-4 border-l-2 border-muted space-y-2">
          {edits.map((edit) => {
            const fields: string[] = (() => { try { return JSON.parse(edit.changedFields ?? "[]"); } catch { return []; } })();
            return (
              <div key={edit.id} className="relative">
                <div className="absolute -left-[1.1rem] top-1 w-2.5 h-2.5 rounded-full bg-primary/60 border-2 border-background" />
                <p className="text-xs font-medium text-foreground">
                  {new Date(edit.editedAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
                {fields.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Changed: {fields.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Property Card ────────────────────────────────────────────────────────────
function PropertyCard({ prop, token, onRefresh }: { prop: any; token: string; onRefresh: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const markSoldMutation = trpc.publicListing.markPropertyAsSold.useMutation({
    onSuccess: () => { toast.success("Property marked as Sold."); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.publicListing.deleteMyProperty.useMutation({
    onSuccess: () => { toast.success("Listing deleted."); setDeleteOpen(false); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-40 h-36 sm:h-auto shrink-0">
            <img
              src={prop.imageUrl || getFallbackImageUrl(prop.propertyType)}
              alt={prop.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.startsWith('data:')) {
                  target.src = getFallbackImageUrl(prop.propertyType);
                }
              }}
            />
          </div>
          <CardContent className="flex-1 py-4 px-4 sm:px-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">{prop.title}</h3>
              </div>
              <StatusBadge status={prop.listingStatus} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {prop.location}
              </span>
              <span className="flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5" />
                ₹{Number(prop.price).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              <Badge variant="secondary">{prop.propertyType}</Badge>
              <Badge variant="outline">{prop.status}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {prop.listingStatus === "published" && prop.slug && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/properties/${prop.slug}`}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Details
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href={`/my-listings/edit-property/${prop.id}`}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
              {prop.status !== "Sold" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => markSoldMutation.mutate({ firebaseToken: token, id: prop.id })}
                  disabled={markSoldMutation.isPending}
                >
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {markSoldMutation.isPending ? "Updating…" : "Mark as Sold"}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>

            {prop.listingStatus === "rejected" && prop.rejectionReason && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                  <p className="text-xs text-red-600 mt-0.5">{prop.rejectionReason}</p>
                </div>
              </div>
            )}
            {prop.listingStatus === "published" && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">Your property is live and visible to buyers.</p>
              </div>
            )}
            {prop.createdAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Submitted {new Date(prop.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            <EditHistoryTimeline token={token} listingType="property" listingId={prop.id} />
          </CardContent>
        </div>
      </Card>

      <EditPropertyDialog
        prop={prop}
        token={token}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={onRefresh}
      />
      <DeleteConfirmDialog
        title={prop.title}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate({ firebaseToken: token, id: prop.id })}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ proj, token, onRefresh }: { proj: any; token: string; onRefresh: () => void }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const markSoldMutation = trpc.publicListing.markProjectAsSold.useMutation({
    onSuccess: () => { toast.success("Project marked as Sold Out."); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.publicListing.deleteMyProject.useMutation({
    onSuccess: () => { toast.success("Project listing deleted."); setDeleteOpen(false); onRefresh(); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {proj.coverImage && (
            <div className="sm:w-40 h-36 sm:h-auto shrink-0">
              <img src={proj.coverImage} alt={proj.name} className="w-full h-full object-cover" />
            </div>
          )}
          <CardContent className="flex-1 py-4 px-4 sm:px-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <h3 className="font-semibold text-foreground">{proj.name}</h3>
              </div>
              <StatusBadge status={proj.listingStatus} />
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {proj.location}, {proj.city}
              </span>
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                {proj.builderName}
              </span>
            </div>

            <div className="flex gap-2 flex-wrap mb-3">
              <Badge variant="secondary">{proj.status}</Badge>
              <Badge variant="outline">{proj.priceRange}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mt-3">
              {proj.listingStatus === "published" && proj.slug && (
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/projects/${proj.slug}`}>
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    View Details
                  </Link>
                </Button>
              )}
              <Button size="sm" variant="outline" asChild>
                <Link href={`/my-listings/edit-project/${proj.id}`}>
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit
                </Link>
              </Button>
              {proj.status !== "Sold Out" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => markSoldMutation.mutate({ firebaseToken: token, id: proj.id })}
                  disabled={markSoldMutation.isPending}
                >
                  <Tag className="h-3.5 w-3.5 mr-1.5" />
                  {markSoldMutation.isPending ? "Updating…" : "Mark as Sold Out"}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete
              </Button>
            </div>

            {proj.listingStatus === "rejected" && proj.rejectionReason && (
              <div className="mt-3 flex items-start gap-2 p-3 rounded-md bg-red-50 border border-red-100">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-700">Rejection reason:</p>
                  <p className="text-xs text-red-600 mt-0.5">{proj.rejectionReason}</p>
                </div>
              </div>
            )}
            {proj.listingStatus === "published" && (
              <div className="mt-3 flex items-center gap-2 p-3 rounded-md bg-green-50 border border-green-100">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                <p className="text-xs text-green-700">Your project is live and visible to buyers.</p>
              </div>
            )}
            {proj.createdAt && (
              <p className="text-xs text-muted-foreground mt-2">
                Submitted {new Date(proj.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            <EditHistoryTimeline token={token} listingType="project" listingId={proj.id} />
          </CardContent>
        </div>
      </Card>

      <EditProjectDialog
        proj={proj}
        token={token}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={onRefresh}
      />
      <DeleteConfirmDialog
        title={proj.name}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate({ firebaseToken: token, id: proj.id })}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────
function MyListingsContent({ verified }: { verified: VerifiedSession }) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.publicListing.getMyListings.useQuery(
    { firebaseToken: verified.token },
    { retry: false }
  );

  const refresh = () => utils.publicListing.getMyListings.invalidate();

  const myProperties = data?.properties ?? [];
  const myProjects = data?.projects ?? [];
  const total = myProperties.length + myProjects.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading your listings...
      </div>
    );
  }

  if (total === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-16 text-center">
          <Home className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No listings yet</h3>
          <p className="text-muted-foreground mb-6">
            You haven't submitted any properties or projects yet.
          </p>
          <Button asChild>
            <Link href="/list-property/submit">
              <Plus className="h-4 w-4 mr-2" />
              Submit Your First Listing
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          <Phone className="h-3.5 w-3.5 inline mr-1" />
          Showing listings for <strong>{verified.phone}</strong>
        </p>
        <Button asChild size="sm">
          <Link href="/list-property/submit">
            <Plus className="h-4 w-4 mr-1.5" />
            Add New Listing
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={myProperties.length > 0 ? "properties" : "projects"}>
        <TabsList className="mb-4">
          <TabsTrigger value="properties">
            Properties
            {myProperties.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myProperties.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="projects">
            Projects
            {myProjects.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myProjects.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          {myProperties.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No property submissions yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myProperties.map((prop: any) => (
                <PropertyCard key={prop.id} prop={prop} token={verified.token} onRefresh={refresh} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="projects">
          {myProjects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No project submissions yet.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myProjects.map((proj: any) => (
                <ProjectCard key={proj.id} proj={proj} token={verified.token} onRefresh={refresh} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function MyListings() {
  const [verified, setVerified] = useState<VerifiedSession | null>(() => {
    // Restore session from sessionStorage so navigating back from edit pages keeps the user verified
    try {
      const stored = sessionStorage.getItem("nivaara_public_session");
      if (stored) return JSON.parse(stored) as VerifiedSession;
    } catch {}
    return null;
  });

  const handleVerified = (phone: string, token: string) => {
    const session: VerifiedSession = { phone, token };
    // Persist to sessionStorage so EditMyProperty / EditMyProject can read it after navigation
    sessionStorage.setItem("nivaara_public_session", JSON.stringify(session));
    setVerified(session);
  };

  return (
    <div className="container py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">My Listings</h1>
        <p className="text-muted-foreground">
          Track, edit, and manage your property and project submissions. Verify your mobile number to view your listings.
        </p>
      </div>

      {!verified ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              Verify Your Mobile Number
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Enter the same mobile number you used when submitting your listing. We'll send a one-time OTP to confirm your identity.
            </p>
            <PhoneOtpVerification
              onVerified={handleVerified}
            />
          </CardContent>
        </Card>
      ) : (
        <MyListingsContent verified={verified} />
      )}
    </div>
  );
}
