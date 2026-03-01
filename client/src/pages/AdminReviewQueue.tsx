import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Building2, Home, Phone, User, MapPin, IndianRupee, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminReviewQueue() {
  const [rejectTarget, setRejectTarget] = useState<{ type: "property" | "project"; id: number; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, refetch } = trpc.publicListing.adminListPending.useQuery();

  const utils = trpc.useUtils();

  const approveProperty = trpc.publicListing.approveProperty.useMutation({
    onSuccess: () => {
      toast.success("Property approved and published!");
      utils.publicListing.adminListPending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectProperty = trpc.publicListing.rejectProperty.useMutation({
    onSuccess: () => {
      toast.success("Property rejected.");
      setRejectTarget(null);
      setRejectReason("");
      utils.publicListing.adminListPending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const approveProject = trpc.publicListing.approveProject.useMutation({
    onSuccess: () => {
      toast.success("Project approved and published!");
      utils.publicListing.adminListPending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const rejectProject = trpc.publicListing.rejectProject.useMutation({
    onSuccess: () => {
      toast.success("Project rejected.");
      setRejectTarget(null);
      setRejectReason("");
      utils.publicListing.adminListPending.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const handleReject = () => {
    if (!rejectTarget || !rejectReason.trim()) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    if (rejectTarget.type === "property") {
      rejectProperty.mutate({ id: rejectTarget.id, reason: rejectReason });
    } else {
      rejectProject.mutate({ id: rejectTarget.id, reason: rejectReason });
    }
  };

  const pendingProperties = data?.properties ?? [];
  const pendingProjects = data?.projects ?? [];
  const totalPending = pendingProperties.length + pendingProjects.length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Public Listing Review Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and approve property/project submissions from the public.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalPending > 0 && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {totalPending} Pending
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading pending submissions...
        </div>
      ) : totalPending === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
            <p className="text-muted-foreground mt-1">No pending submissions to review.</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="properties">
          <TabsList className="mb-4">
            <TabsTrigger value="properties">
              Properties
              {pendingProperties.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingProperties.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="projects">
              Projects
              {pendingProjects.length > 0 && (
                <Badge variant="secondary" className="ml-2">{pendingProjects.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <div className="grid gap-4">
              {pendingProperties.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No pending property submissions.
                  </CardContent>
                </Card>
              ) : (
                pendingProperties.map((prop: any) => (
                  <Card key={prop.id} className="border-l-4 border-l-amber-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Home className="h-5 w-5 text-primary shrink-0" />
                          <CardTitle className="text-base">{prop.title}</CardTitle>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-400">
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{prop.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>₹{Number(prop.price).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{prop.submitterName || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{prop.submitterPhone || "—"}</span>
                        </div>
                      </div>
                      {prop.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{prop.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{prop.propertyType}</Badge>
                        <Badge variant="secondary">{prop.status}</Badge>
                        {prop.bedrooms && <Badge variant="outline">{prop.bedrooms} BHK</Badge>}
                      </div>
                      {prop.imageUrl && (
                        <img
                          src={prop.imageUrl}
                          alt={prop.title}
                          className="mt-3 h-32 w-full object-cover rounded-md"
                        />
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveProperty.mutate({ id: prop.id })}
                          disabled={approveProperty.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setRejectTarget({ type: "property", id: prop.id, name: prop.title })}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <div className="grid gap-4">
              {pendingProjects.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    No pending project submissions.
                  </CardContent>
                </Card>
              ) : (
                pendingProjects.map((proj: any) => (
                  <Card key={proj.id} className="border-l-4 border-l-blue-400">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-primary shrink-0" />
                          <CardTitle className="text-base">{proj.name}</CardTitle>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-amber-600 border-amber-400">
                          Pending Review
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          <span>{proj.location}, {proj.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span>{proj.builderName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <User className="h-3.5 w-3.5" />
                          <span>{proj.submitterName || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{proj.submitterPhone || "—"}</span>
                        </div>
                      </div>
                      {proj.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{proj.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{proj.status}</Badge>
                        <Badge variant="outline">{proj.priceRange}</Badge>
                        {proj.reraNumber && <Badge variant="outline">RERA: {proj.reraNumber}</Badge>}
                      </div>
                      {proj.coverImage && (
                        <img
                          src={proj.coverImage}
                          alt={proj.name}
                          className="mt-3 h-32 w-full object-cover rounded-md"
                        />
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => approveProject.mutate({ id: proj.id })}
                          disabled={approveProject.isPending}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" />
                          Approve & Publish
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          onClick={() => setRejectTarget({ type: "project", id: proj.id, name: proj.name })}
                        >
                          <XCircle className="h-4 w-4 mr-1.5" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Reject Dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Submission</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-4">
              You are rejecting: <strong>{rejectTarget?.name}</strong>
            </p>
            <Label>Reason for rejection *</Label>
            <Textarea
              className="mt-1.5"
              placeholder="e.g. Incomplete information, duplicate listing, suspicious content..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectProperty.isPending || rejectProject.isPending}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
