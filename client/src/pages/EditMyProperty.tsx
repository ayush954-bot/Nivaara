import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";
import LocationAutocomplete from "@/components/LocationAutocomplete";

interface VerifiedSession {
  phone: string;
  token: string;
}

interface ImageItem {
  url: string;
  isUploading?: boolean;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditMyProperty() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const propertyId = parseInt(params.id ?? "0");

  const [session, setSession] = useState<VerifiedSession | null>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem("nivaara_public_session");
    if (stored) {
      try { setSession(JSON.parse(stored)); } catch {}
    }
  }, []);

  const { data: prop, isLoading } = trpc.publicListing.getMyPropertyById.useQuery(
    { firebaseToken: session?.token ?? "", id: propertyId },
    { enabled: !!session?.token && propertyId > 0 }
  );

  const uploadMutation = trpc.publicListing.uploadFile.useMutation();
  const updateMutation = trpc.publicListing.updateMyProperty.useMutation({
    onSuccess: () => {
      toast.success("Changes saved. Your listing is now pending re-review by our team.");
      navigate("/my-listings");
    },
    onError: (e) => toast.error(e.message),
  });

  // Form state — only fields that exist in the DB schema
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [priceLabel, setPriceLabel] = useState("");
  const [status, setStatus] = useState<"Under-Construction" | "Ready" | "Sold">("Ready");
  const [propertyType, setPropertyType] = useState("Flat");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [areaSqft, setAreaSqft] = useState(""); // area_sqft (number)
  const [areaLocality, setAreaLocality] = useState(""); // area varchar (e.g. "Kharadi")
  const [builderName, setBuilderName] = useState(""); // maps to builder column
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [badge, setBadge] = useState("none");
  const [customBadgeText, setCustomBadgeText] = useState("");
  const [brochureUrl, setBrochureUrl] = useState("");
  const [videoUrls, setVideoUrls] = useState<string[]>([""]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (prop && !initialized) {
      setTitle(prop.title ?? "");
      setDescription(prop.description ?? "");
      setPrice(String(prop.price ?? ""));
      setPriceLabel(prop.priceLabel ?? "");
      setStatus((prop.status as any) ?? "Ready");
      setPropertyType(prop.propertyType ?? "Flat");
      setBedrooms(String(prop.bedrooms ?? ""));
      setBathrooms(String(prop.bathrooms ?? ""));
      setAreaSqft(String(prop.area_sqft ?? ""));
      setAreaLocality(prop.area ?? "");
      setBuilderName(prop.builder ?? "");
      setLocation(prop.location ?? "");
      setLatitude(prop.latitude ? parseFloat(String(prop.latitude)) : undefined);
      setLongitude(prop.longitude ? parseFloat(String(prop.longitude)) : undefined);
      setBadge(prop.badge ?? "none");
      setCustomBadgeText(prop.customBadgeText ?? "");
      setBrochureUrl(prop.brochureUrl ?? "");
      if (prop.videoUrl) {
        try {
          const parsed = JSON.parse(prop.videoUrl);
          setVideoUrls(Array.isArray(parsed) ? parsed : [prop.videoUrl]);
        } catch {
          setVideoUrls([prop.videoUrl]);
        }
      }
      if (prop.images && prop.images.length > 0) {
        setImages(prop.images.map((img: any) => ({ url: img.imageUrl })));
      }
      setInitialized(true);
    }
  }, [prop, initialized]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !session) return;
    const fileArr = Array.from(files).slice(0, 20 - images.length);
    for (const file of fileArr) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10 MB.`); continue; }
      setImages((prev) => [...prev, { url: "", isUploading: true }]);
      try {
        const base64 = await fileToBase64(file);
        const result = await uploadMutation.mutateAsync({
          firebaseToken: session.token,
          fileName: file.name,
          mimeType: file.type,
          base64Data: base64,
        });
        setImages((prev) => {
          const idx = prev.findIndex((i) => i.isUploading);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { url: result.url };
          return next;
        });
      } catch (e: any) {
        toast.error("Upload failed: " + e.message);
        setImages((prev) => prev.filter((i) => !i.isUploading));
      }
    }
  };

  const handleBrochureUpload = async (file: File) => {
    if (!session) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Brochure exceeds 10 MB."); return; }
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadMutation.mutateAsync({
        firebaseToken: session.token,
        fileName: file.name,
        mimeType: file.type,
        base64Data: base64,
      });
      setBrochureUrl(result.url);
      toast.success("Brochure uploaded.");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    }
  };

  const handleSubmit = () => {
    if (!session) return;
    const filteredVideos = videoUrls.filter((v) => v.trim());
    updateMutation.mutate({
      firebaseToken: session.token,
      id: propertyId,
      title: title || undefined,
      description: description || undefined,
      price: price || undefined,
      priceLabel: priceLabel || undefined,
      status: status || undefined,
      propertyType: propertyType || undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      area: areaLocality || undefined,
      builderName: builderName || undefined,
      location: location || undefined,
      latitude: latitude,
      longitude: longitude,
      badge: badge !== "none" ? badge : undefined,
      customBadgeText: badge === "custom" ? customBadgeText : undefined,
      brochureUrl: brochureUrl || undefined,
      videoUrls: filteredVideos,
      imageUrls: images.filter((i) => !i.isUploading && i.url).map((i) => i.url),
    });
  };

  if (!session) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Please verify your phone number first.</p>
        <Button asChild><Link href="/my-listings">Go to My Listings</Link></Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!prop) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Property not found or you don't have access.</p>
        <Button asChild><Link href="/my-listings">Back to My Listings</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/my-listings"><ArrowLeft className="h-4 w-4 mr-1" />My Listings</Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Property</h1>
      </div>

      {/* Re-review notice banners */}
      {prop.listingStatus === "published" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 mb-6">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm">Saving changes will take your listing offline for re-review</p>
            <p className="text-amber-700 text-sm mt-1">Your property is currently <strong>live</strong>. Once you save edits, it will be moved to <strong>Pending Review</strong> and temporarily hidden from buyers until a staff member re-approves it (usually within 30 minutes).</p>
          </div>
        </div>
      )}
      {prop.listingStatus === "pending_review" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200 mb-6">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-800 text-sm">Your listing is already pending review</p>
            <p className="text-blue-700 text-sm mt-1">You can update the details below. After saving, it will remain in the review queue for staff approval.</p>
          </div>
        </div>
      )}
      {prop.listingStatus === "rejected" && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200 mb-6">
          <Info className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-green-800 text-sm">Fix and resubmit for review</p>
            <p className="text-green-700 text-sm mt-1">Your listing was previously rejected. Update the details below and save — it will be sent back to staff for re-review.</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Property Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 3 BHK Flat in Kharadi" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Property Type</Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat">Flat / Apartment</SelectItem>
                    <SelectItem value="Shop">Shop / Commercial</SelectItem>
                    <SelectItem value="Office">Office Space</SelectItem>
                    <SelectItem value="Land">Plot / Land</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Bank Auction">Bank Auction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ready">Ready to Move</SelectItem>
                    <SelectItem value="Under-Construction">Under Construction</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe the property..." />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Full Address / Location</Label>
              <LocationAutocomplete
                value={location}
                onChange={(val, lat, lng) => {
                  setLocation(val);
                  if (lat !== undefined) setLatitude(lat);
                  if (lng !== undefined) setLongitude(lng);
                }}
                placeholder="Search location (e.g. Kharadi, Pune)"
              />
            </div>
            <div className="space-y-1">
              <Label>Area / Locality Name</Label>
              <Input value={areaLocality} onChange={(e) => setAreaLocality(e.target.value)} placeholder="e.g. Kharadi, Viman Nagar" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Latitude</Label>
                <Input type="number" value={latitude ?? ""} onChange={(e) => setLatitude(parseFloat(e.target.value) || undefined)} placeholder="Auto-filled from map" />
              </div>
              <div className="space-y-1">
                <Label>Longitude</Label>
                <Input type="number" value={longitude ?? ""} onChange={(e) => setLongitude(parseFloat(e.target.value) || undefined)} placeholder="Auto-filled from map" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Price */}
        <Card>
          <CardHeader><CardTitle>Price</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Price (₹)</Label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 5000000" />
              </div>
              <div className="space-y-1">
                <Label>Price Label</Label>
                <Input value={priceLabel} onChange={(e) => setPriceLabel(e.target.value)} placeholder="e.g. ₹50 Lakh onwards" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader><CardTitle>Property Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label>Bedrooms</Label>
                <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="e.g. 3" />
              </div>
              <div className="space-y-1">
                <Label>Bathrooms</Label>
                <Input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="e.g. 2" />
              </div>
              <div className="space-y-1">
                <Label>Area (sq ft)</Label>
                <Input type="number" value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} placeholder="e.g. 1200" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Builder / Developer Name</Label>
              <Input value={builderName} onChange={(e) => setBuilderName(e.target.value)} placeholder="e.g. Godrej Properties" />
            </div>
          </CardContent>
        </Card>

        {/* Badge */}
        <Card>
          <CardHeader><CardTitle>Badge</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Badge Type</Label>
                <Select value={badge} onValueChange={setBadge}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Badge</SelectItem>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="hot">Hot Deal</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {badge === "custom" && (
                <div className="space-y-1">
                  <Label>Custom Badge Text</Label>
                  <Input value={customBadgeText} onChange={(e) => setCustomBadgeText(e.target.value)} placeholder="e.g. Price Drop" maxLength={25} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  {img.isUploading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >×</button>
                    </>
                  )}
                </div>
              ))}
              {images.length < 20 && (
                <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add Photo</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Max 20 photos, 10 MB each.</p>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader><CardTitle>Video Links</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {videoUrls.map((url, idx) => (
              <div key={idx} className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const next = [...videoUrls];
                    next[idx] = e.target.value;
                    setVideoUrls(next);
                  }}
                  placeholder="YouTube / Vimeo / virtual tour URL"
                />
                <Button variant="ghost" size="icon" onClick={() => setVideoUrls((prev) => prev.filter((_, i) => i !== idx))} disabled={videoUrls.length === 1}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => setVideoUrls((prev) => [...prev, ""])}>
              <Plus className="h-4 w-4 mr-1" /> Add Video Link
            </Button>
          </CardContent>
        </Card>

        {/* Brochure */}
        <Card>
          <CardHeader><CardTitle>Brochure (PDF)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {brochureUrl && (
              <div className="flex items-center gap-2 text-sm">
                <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">View current brochure</a>
                <Button variant="ghost" size="sm" onClick={() => setBrochureUrl("")}>Remove</Button>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span><Upload className="h-4 w-4 mr-1" />Upload New Brochure</span>
              </Button>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleBrochureUpload(e.target.files[0])} />
            </label>
          </CardContent>
        </Card>

        <Separator />
        <div className="flex gap-3 justify-end pb-8">
          <Button variant="outline" asChild>
            <Link href="/my-listings">Cancel</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={updateMutation.isPending || !title}>
            {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
