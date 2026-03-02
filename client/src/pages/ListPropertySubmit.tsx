import { useState, useCallback } from "react";
import { Link } from "wouter";
import PhoneOtpVerification from "@/components/PhoneOtpVerification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { detectZone } from "@/lib/locations";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import {
  CheckCircle2,
  Upload,
  X,
  ArrowLeft,
  Home,
  Building2,
  Clock,
  Loader2,
  Plus,
  Trash2,
  Star,
  Video,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

type ListingType = "property" | "project";
type VerifiedState = { phone: string; token: string } | null;

const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGES = 20;

// ─── Amenity icon options (same as admin form) ────────────────────────────────
const AMENITY_ICONS = [
  { value: "Dumbbell", label: "Gym" },
  { value: "Waves", label: "Swimming Pool" },
  { value: "Trees", label: "Garden" },
  { value: "Car", label: "Parking" },
  { value: "Shield", label: "Security" },
  { value: "Zap", label: "Power Backup" },
  { value: "Droplets", label: "Water Supply" },
  { value: "Wind", label: "Air Conditioning" },
  { value: "Gamepad2", label: "Play Area" },
  { value: "Users", label: "Clubhouse" },
  { value: "Utensils", label: "Restaurant" },
  { value: "ShoppingBag", label: "Shopping" },
  { value: "GraduationCap", label: "School" },
  { value: "Stethoscope", label: "Hospital" },
  { value: "Wifi", label: "Internet" },
  { value: "Flame", label: "Gas Pipeline" },
  { value: "Footprints", label: "Jogging Track" },
  { value: "Trophy", label: "Sports" },
  { value: "Film", label: "Theater" },
  { value: "Sparkles", label: "Spa" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedImage {
  file?: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: string;
  isCover: boolean;
}

interface ProjectVideo {
  videoUrl: string;
  videoType: "youtube" | "vimeo" | "virtual_tour" | "other";
  title: string;
}

interface Amenity {
  name: string;
  icon: string;
}

interface FloorPlan {
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
}

// ─── Inline public-safe file uploader ────────────────────────────────────────
function usePublicUpload(firebaseToken: string) {
  const uploadFileMutation = trpc.publicListing.uploadFile.useMutation();

  const uploadFile = useCallback(
    async (file: File): Promise<string> => {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(`File "${file.name}" exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      }
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let b = 0; b < bytes.byteLength; b++) binary += String.fromCharCode(bytes[b]);
      const base64Data = btoa(binary);
      const result = await uploadFileMutation.mutateAsync({
        fileName: file.name,
        mimeType: file.type,
        base64Data,
        firebaseToken,
      });
      return result.url;
    },
    [firebaseToken, uploadFileMutation]
  );

  return { uploadFile, isUploading: uploadFileMutation.isPending };
}

// ─── Image Gallery Upload (public-safe) ──────────────────────────────────────
function PublicImageGallery({
  images,
  onChange,
  firebaseToken,
}: {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  firebaseToken: string;
}) {
  const { uploadFile } = usePublicUpload(firebaseToken);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.filter((i) => i.url).length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }

    const toProcess = files.slice(0, remaining);
    const oversized = toProcess.filter((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      toast.error(`${oversized.length} file(s) exceed ${MAX_FILE_SIZE_MB} MB and were skipped.`);
    }
    const valid = toProcess.filter((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    if (!valid.length) return;

    const newEntries: UploadedImage[] = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      isCover: images.length === 0, // first image is cover
    }));

    const updated = [...images, ...newEntries];
    onChange(updated);
    setUploading(true);

    for (const entry of newEntries) {
      try {
        const url = await uploadFile(entry.file!);
        onChange(
          updated.map((img) =>
            img.preview === entry.preview ? { ...img, uploading: false, url } : img
          )
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Upload failed";
        toast.error(msg);
        onChange(
          updated.map((img) =>
            img.preview === entry.preview ? { ...img, uploading: false, error: "Failed" } : img
          )
        );
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const setCover = (preview: string) => {
    onChange(images.map((img) => ({ ...img, isCover: img.preview === preview })));
  };

  const remove = (preview: string) => {
    const entry = images.find((i) => i.preview === preview);
    if (entry) URL.revokeObjectURL(entry.preview);
    const remaining = images.filter((i) => i.preview !== preview);
    // If we removed the cover, set first remaining as cover
    if (entry?.isCover && remaining.length > 0) {
      remaining[0].isCover = true;
    }
    onChange(remaining);
  };

  return (
    <div className="space-y-3">
      <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 text-primary animate-spin mb-1" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-sm text-muted-foreground">Click to upload photos (max {MAX_FILE_SIZE_MB} MB each)</span>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={uploading || images.filter((i) => i.url).length >= MAX_IMAGES}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img) => (
            <div
              key={img.preview}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                img.isCover ? "border-primary" : "border-border"
              } bg-secondary/20`}
            >
              <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
              {img.uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                </div>
              )}
              {img.error && (
                <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
                  <span className="text-white text-xs text-center px-1">Failed</span>
                </div>
              )}
              {!img.uploading && !img.error && img.url && (
                <>
                  <button
                    type="button"
                    onClick={() => remove(img.preview)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCover(img.preview)}
                    className={`absolute bottom-1 left-1 w-5 h-5 rounded-full flex items-center justify-center ${
                      img.isCover ? "bg-primary" : "bg-black/60 hover:bg-black/80"
                    }`}
                    title={img.isCover ? "Cover image" : "Set as cover"}
                  >
                    <Star className="h-3 w-3 text-white" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          <Star className="inline h-3 w-3 text-primary mr-1" />
          Click the star icon to set cover image
        </p>
      )}
    </div>
  );
}

// ─── Single file uploader (for brochure, builder logo, master plan) ───────────
function PublicSingleFileUpload({
  value,
  onChange,
  firebaseToken,
  accept = "image/*,application/pdf",
  placeholder = "Upload file or paste URL",
  helpText,
}: {
  value: string;
  onChange: (url: string) => void;
  firebaseToken: string;
  accept?: string;
  placeholder?: string;
  helpText?: string;
}) {
  const { uploadFile, isUploading } = usePublicUpload(firebaseToken);
  const [showUrl, setShowUrl] = useState(!value);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      onChange(url);
      toast.success("Uploaded successfully");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    }
    e.target.value = "";
  };

  const isPdf =
    value &&
    (value.toLowerCase().endsWith(".pdf") ||
      value.toLowerCase().includes("brochure") ||
      value.toLowerCase().includes("/pdf"));

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="flex-1">
          {showUrl ? (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={isUploading}
            />
          ) : (
            <Input
              type="file"
              accept={accept}
              onChange={handleFile}
              disabled={isUploading}
              className="cursor-pointer"
            />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowUrl(!showUrl)}
          title={showUrl ? "Switch to file upload" : "Switch to URL input"}
        >
          {showUrl ? <Upload className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      {value && value.startsWith("http") && (
        <div className="mt-1">
          {isPdf ? (
            <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded border">
              <span className="text-xs text-primary">📄</span>
              <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                View PDF
              </a>
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className="h-16 w-16 object-cover rounded border"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ListPropertySubmit() {
  const [verified, setVerified] = useState<VerifiedState>(null);
  const [submitterName, setSubmitterName] = useState("");
  const [listingType, setListingType] = useState<ListingType>("property");
  const [submitted, setSubmitted] = useState(false);

  // ─── Property form state (mirrors admin PropertyForm exactly) ───────────────
  const [propForm, setPropForm] = useState({
    title: "",
    description: "",
    propertyType: "" as "Flat" | "Shop" | "Office" | "Land" | "Rental" | "Bank Auction" | "",
    status: "" as "Under-Construction" | "Ready" | "",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    area: "",
    price: "",
    priceLabel: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    builder: "",
    brochureUrl: "",
    badge: "",
    customBadgeText: "",
  });
  const [propImages, setPropImages] = useState<UploadedImage[]>([]);
  const [propVideos, setPropVideos] = useState<Array<{
    videoUrl: string;
    videoType: "youtube" | "vimeo" | "virtual_tour" | "other";
    displayOrder: number;
  }>>([]);
  const [newPropVideoUrl, setNewPropVideoUrl] = useState("");
  const [newPropVideoType, setNewPropVideoType] = useState<"youtube" | "vimeo" | "virtual_tour" | "other">("youtube");

  // ─── Project form state (mirrors admin ProjectForm exactly) ─────────────────
  const [projForm, setProjForm] = useState({
    name: "",
    builderName: "",
    description: "",
    location: "",
    city: "Pune",
    latitude: null as number | null,
    longitude: null as number | null,
    status: "" as "Upcoming" | "Under Construction" | "Ready to Move" | "",
    priceRange: "",
    minPrice: "",
    maxPrice: "",
    configurations: "",
    reraNumber: "",
    possessionDate: "",
    totalUnits: "",
    towers: "",
    floors: "",
    videoUrl: "",
    brochureUrl: "",
    masterPlanUrl: "",
    builderDescription: "",
    builderLogo: "",
    builderEstablished: "",
    builderProjects: "",
    badge: "",
    customBadgeText: "",
  });
  const [projImages, setProjImages] = useState<UploadedImage[]>([]);
  const [projVideos, setProjVideos] = useState<ProjectVideo[]>([]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);

  // ─── Mutations ───────────────────────────────────────────────────────────────
  const submitPropertyMutation = trpc.publicListing.submitProperty.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message?: string }) =>
      toast.error(err.message || "Submission failed. Please try again."),
  });

  const submitProjectMutation = trpc.publicListing.submitProject.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message?: string }) =>
      toast.error(err.message || "Submission failed. Please try again."),
  });

  // ─── Submit handlers ─────────────────────────────────────────────────────────
  const handleSubmitProperty = () => {
    if (!verified) return;
    if (!submitterName.trim()) { toast.error("Please enter your name."); return; }
    if (!propForm.title) { toast.error("Property title is required."); return; }
    if (!propForm.propertyType) { toast.error("Property type is required."); return; }
    if (!propForm.status) { toast.error("Property status is required."); return; }
    if (!propForm.location || !propForm.latitude || !propForm.longitude) {
      toast.error("Please select a location from the dropdown suggestions (coordinates required).");
      return;
    }
    if (!propForm.price) { toast.error("Price is required."); return; }

    const imageUrls = propImages.filter((i) => i.url).map((i) => i.url!);
    // Reorder so cover is first
    const coverIdx = propImages.findIndex((i) => i.isCover && i.url);
    const orderedUrls =
      coverIdx > 0
        ? [imageUrls[coverIdx], ...imageUrls.filter((_, idx) => idx !== coverIdx)]
        : imageUrls;

    submitPropertyMutation.mutate({
      title: propForm.title,
      description: propForm.description,
      propertyType: propForm.propertyType as "Flat" | "Shop" | "Office" | "Land" | "Rental" | "Bank Auction",
      status: propForm.status as "Under-Construction" | "Ready",
      location: propForm.location,
      latitude: propForm.latitude ?? undefined,
      longitude: propForm.longitude ?? undefined,
      area: propForm.area || undefined,
      price: parseFloat(propForm.price),
      priceLabel: propForm.priceLabel || undefined,
      bedrooms: propForm.bedrooms ? parseInt(propForm.bedrooms) : undefined,
      bathrooms: propForm.bathrooms ? parseInt(propForm.bathrooms) : undefined,
      area_sqft: propForm.area_sqft ? parseInt(propForm.area_sqft) : undefined,
      builder: propForm.builder || undefined,
      imageUrls: orderedUrls,
      videoUrls: propVideos,
      brochureUrl: propForm.brochureUrl || undefined,
      badge: propForm.badge || undefined,
      customBadgeText: propForm.customBadgeText || undefined,
      submitterPhone: verified.phone,
      submitterName,
      firebaseToken: verified.token,
    });
  };

  const handleSubmitProject = () => {
    if (!verified) return;
    if (!submitterName.trim()) { toast.error("Please enter your name."); return; }
    if (!projForm.name) { toast.error("Project name is required."); return; }
    if (!projForm.builderName) { toast.error("Builder name is required."); return; }
    if (!projForm.description) { toast.error("Description is required."); return; }
    if (!projForm.location) { toast.error("Location is required."); return; }
    if (!projForm.priceRange) { toast.error("Price range is required."); return; }
    if (!projForm.status) { toast.error("Project status is required."); return; }

    const imageUrls = projImages.filter((i) => i.url).map((i) => i.url!);

    submitProjectMutation.mutate({
      name: projForm.name,
      builderName: projForm.builderName,
      description: projForm.description,
      location: projForm.location,
      city: projForm.city,
      latitude: projForm.latitude ?? undefined,
      longitude: projForm.longitude ?? undefined,
      status: projForm.status as "Upcoming" | "Under Construction" | "Ready to Move",
      priceRange: projForm.priceRange,
      minPrice: projForm.minPrice ? parseFloat(projForm.minPrice) : undefined,
      maxPrice: projForm.maxPrice ? parseFloat(projForm.maxPrice) : undefined,
      configurations: projForm.configurations || undefined,
      reraNumber: projForm.reraNumber || undefined,
      possessionDate: projForm.possessionDate || undefined,
      totalUnits: projForm.totalUnits ? parseInt(projForm.totalUnits) : undefined,
      towers: projForm.towers ? parseInt(projForm.towers) : undefined,
      floors: projForm.floors ? parseInt(projForm.floors) : undefined,
      imageUrls,
      videoUrl: projForm.videoUrl || undefined,
      brochureUrl: projForm.brochureUrl || undefined,
      masterPlanUrl: projForm.masterPlanUrl || undefined,
      videos: projVideos.map((v, i) => ({ ...v, displayOrder: i })),
      builderDescription: projForm.builderDescription || undefined,
      builderLogo: projForm.builderLogo || undefined,
      builderEstablished: projForm.builderEstablished ? parseInt(projForm.builderEstablished) : undefined,
      builderProjects: projForm.builderProjects ? parseInt(projForm.builderProjects) : undefined,
      badge: projForm.badge || undefined,
      customBadgeText: projForm.customBadgeText || undefined,
      amenities: amenities
        .filter((a) => a.name)
        .map((a, i) => ({ name: a.name, icon: a.icon, displayOrder: i })),
      floorPlans: floorPlans
        .filter((fp) => fp.name)
        .map((fp, i) => ({ ...fp, displayOrder: i })),
      submitterPhone: verified.phone,
      submitterName,
      firebaseToken: verified.token,
    });
  };

  // ─── Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Listing Submitted!</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Thank you for listing with Nivaara. Our team will review your submission within{" "}
            <strong>30 minutes</strong>. Once approved, your listing will go live on the website.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/40 rounded-lg p-3 mb-8">
            <Clock className="h-4 w-4 shrink-0 text-primary" />
            <span>You'll be notified via the phone number you verified.</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/my-listings">
              <Button variant="default">View My Listings</Button>
            </Link>
            <Link href="/list-property/submit">
              <Button variant="outline">Submit Another Listing</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── OTP gate ─────────────────────────────────────────────────────────────────
  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary/20 to-background py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <Link href="/list-property">
              <button className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
                <ArrowLeft className="h-4 w-4" />
                Back to listing info
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Verify Your Identity</h1>
            <p className="text-muted-foreground">
              A quick one-time verification to keep the platform spam-free.
            </p>
          </div>
          <PhoneOtpVerification
            onVerified={(phone, token) => {
              // Persist to sessionStorage so MyListings and edit pages can read it without re-verification
              try {
                sessionStorage.setItem("nivaara_public_session", JSON.stringify({ phone, token }));
              } catch {}
              setVerified({ phone, token });
            }}
          />
        </div>
      </div>
    );
  }

  // ─── Submission form ──────────────────────────────────────────────────────────
  const isSubmitting =
    submitPropertyMutation.isPending || submitProjectMutation.isPending;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge
              variant="outline"
              className="text-green-600 border-green-300 bg-green-50"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified: {verified.phone}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">List Your Property</h1>
          <p className="text-muted-foreground">
            Fill in the details below. Your listing will be reviewed within 30 minutes.
          </p>
        </div>

        {/* Submitter name */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Details</h2>
          <div>
            <Label htmlFor="submitterName">Your Name *</Label>
            <Input
              id="submitterName"
              placeholder="Enter your full name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </Card>

        {/* Listing type toggle */}
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">What are you listing?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "property",
                label: "Individual Property",
                icon: Home,
                desc: "Flat, Shop, Land, Rental",
              },
              {
                value: "project",
                label: "Builder Project",
                icon: Building2,
                desc: "New launch, Township",
              },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setListingType(opt.value as ListingType)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  listingType === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <opt.icon
                  className={`h-6 w-6 ${
                    listingType === opt.value ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div>
                  <div className="font-medium text-sm text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* ═══════════════════════════════════════════════════════════════════════
            PROPERTY FORM — mirrors admin PropertyForm exactly
        ══════════════════════════════════════════════════════════════════════════ */}
        {listingType === "property" && (
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prop-title">Property Title *</Label>
                  <Input
                    id="prop-title"
                    value={propForm.title}
                    onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                    placeholder="e.g., Luxury 3 BHK Apartment"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="prop-desc">Description</Label>
                  <Textarea
                    id="prop-desc"
                    value={propForm.description}
                    onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                    placeholder="Detailed property description..."
                    rows={4}
                    className="mt-1.5"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Property Type *</Label>
                    <Select
                      value={propForm.propertyType}
                      onValueChange={(v) =>
                        setPropForm({ ...propForm, propertyType: v as typeof propForm.propertyType })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Flat">Flat/Apartment</SelectItem>
                        <SelectItem value="Shop">Shop</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="Land">Land/Plot</SelectItem>
                        <SelectItem value="Rental">Rental</SelectItem>
                        <SelectItem value="Bank Auction">Bank Auction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status *</Label>
                    <Select
                      value={propForm.status}
                      onValueChange={(v) =>
                        setPropForm({ ...propForm, status: v as typeof propForm.status })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ready">Ready to Move</SelectItem>
                        <SelectItem value="Under-Construction">Under Construction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>

            {/* Location Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Location Details</h3>
              <div className="space-y-4">
                <div>
                  <Label>City/Location *</Label>
                  <div className="mt-1.5">
                    <LocationAutocomplete
                      value={propForm.location}
                      onChange={(location, lat, lon) => {
                        const detectedZone = detectZone(location);
                        setPropForm({
                          ...propForm,
                          location,
                          latitude: lat || null,
                          longitude: lon || null,
                        });
                        void detectedZone; // zone is auto-detected server-side
                      }}
                      placeholder="Type to search location (e.g., Kharadi, Pune)"
                    />
                  </div>
                  {propForm.latitude && propForm.longitude ? (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Location coordinates captured (Lat: {propForm.latitude.toFixed(4)}, Lon:{" "}
                      {propForm.longitude.toFixed(4)})
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Please select a location from the dropdown suggestions (coordinates required)
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="prop-area">Additional Area Details (Optional)</Label>
                  <Input
                    id="prop-area"
                    value={propForm.area}
                    onChange={(e) => setPropForm({ ...propForm, area: e.target.value })}
                    placeholder="e.g., Near Airport, Sector 5"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Add extra location details if needed
                  </p>
                </div>
              </div>
            </Card>

            {/* Pricing */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="prop-price">Price (₹) *</Label>
                  <Input
                    id="prop-price"
                    type="number"
                    value={propForm.price}
                    onChange={(e) => setPropForm({ ...propForm, price: e.target.value })}
                    placeholder="e.g., 11500000"
                    className="mt-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter amount in rupees (e.g., 11500000 for ₹1.15 Cr)
                  </p>
                </div>

                <div>
                  <Label htmlFor="prop-priceLabel">Price Label</Label>
                  <Input
                    id="prop-priceLabel"
                    value={propForm.priceLabel}
                    onChange={(e) => setPropForm({ ...propForm, priceLabel: e.target.value })}
                    placeholder="e.g., ₹1.15 Crores"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>

            {/* Property Details */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Property Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(propForm.propertyType === "Flat" || propForm.propertyType === "Rental") && (
                    <>
                      <div>
                        <Label htmlFor="prop-beds">Bedrooms *</Label>
                        <Input
                          id="prop-beds"
                          type="number"
                          value={propForm.bedrooms}
                          onChange={(e) => setPropForm({ ...propForm, bedrooms: e.target.value })}
                          placeholder="e.g., 3"
                          className="mt-1.5"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Required for Flat/Rental
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="prop-baths">Bathrooms</Label>
                        <Input
                          id="prop-baths"
                          type="number"
                          value={propForm.bathrooms}
                          onChange={(e) => setPropForm({ ...propForm, bathrooms: e.target.value })}
                          placeholder="e.g., 2"
                          className="mt-1.5"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <Label htmlFor="prop-sqft">Area (sq ft)</Label>
                    <Input
                      id="prop-sqft"
                      type="number"
                      value={propForm.area_sqft}
                      onChange={(e) => setPropForm({ ...propForm, area_sqft: e.target.value })}
                      placeholder="e.g., 1450"
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="prop-builder">Builder/Developer</Label>
                  <Input
                    id="prop-builder"
                    value={propForm.builder}
                    onChange={(e) => setPropForm({ ...propForm, builder: e.target.value })}
                    placeholder="e.g., Lodha Group, Godrej Properties"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </Card>

            {/* Media */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Media</h3>
              <div className="space-y-6">
                {/* Images */}
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ImageIcon className="h-4 w-4" />
                    Property Photos (up to {MAX_IMAGES}, max {MAX_FILE_SIZE_MB} MB each)
                  </Label>
                  <PublicImageGallery
                    images={propImages}
                    onChange={setPropImages}
                    firebaseToken={verified.token}
                  />
                </div>

                {/* Videos */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Links
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!newPropVideoUrl.trim()) return;
                        setPropVideos([
                          ...propVideos,
                          {
                            videoUrl: newPropVideoUrl.trim(),
                            videoType: newPropVideoType,
                            displayOrder: propVideos.length,
                          },
                        ]);
                        setNewPropVideoUrl("");
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Video
                    </Button>
                  </div>
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newPropVideoUrl}
                      onChange={(e) => setNewPropVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <Select
                      value={newPropVideoType}
                      onValueChange={(v) =>
                        setNewPropVideoType(v as typeof newPropVideoType)
                      }
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {propVideos.map((v, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 border rounded-lg mb-2 bg-secondary/20">
                      <span className="text-xs text-muted-foreground flex-1 truncate">{v.videoUrl}</span>
                      <Badge variant="outline" className="text-xs">{v.videoType}</Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setPropVideos(propVideos.filter((_, idx) => idx !== i))}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Brochure */}
                <div>
                  <Label htmlFor="prop-brochure">Brochure PDF (Optional)</Label>
                  <div className="mt-1.5">
                    <PublicSingleFileUpload
                      value={propForm.brochureUrl}
                      onChange={(url) => setPropForm({ ...propForm, brochureUrl: url })}
                      firebaseToken={verified.token}
                      accept="application/pdf"
                      placeholder="Upload brochure PDF or enter URL"
                      helpText="Upload a PDF brochure for this property"
                    />
                  </div>
                </div>

                {/* Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Property Badge (Optional)</Label>
                    <Select
                      value={propForm.badge || "none"}
                      onValueChange={(v) =>
                        setPropForm({ ...propForm, badge: v === "none" ? "" : v })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select badge or leave empty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Badge</SelectItem>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Big Discount">Big Discount</SelectItem>
                        <SelectItem value="Special Offer">Special Offer</SelectItem>
                        <SelectItem value="Hot Deal">Hot Deal</SelectItem>
                        <SelectItem value="Price Reduced">Price Reduced</SelectItem>
                        <SelectItem value="Exclusive">Exclusive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="prop-custBadge">Custom Badge Text (Optional)</Label>
                    <Input
                      id="prop-custBadge"
                      value={propForm.customBadgeText}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          customBadgeText: e.target.value.slice(0, 25),
                        })
                      }
                      placeholder="e.g., Bank Auction, Owner Motivated"
                      maxLength={25}
                      className="mt-1.5"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Max 25 characters</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={handleSubmitProperty}
                disabled={isSubmitting}
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Property for Review
                  </>
                )}
              </Button>
              <Link href="/list-property">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════════
            PROJECT FORM — mirrors admin ProjectForm exactly (tabbed)
        ══════════════════════════════════════════════════════════════════════════ */}
        {listingType === "project" && (
          <div className="space-y-6">
            <Card className="p-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="flex flex-wrap justify-center gap-1 mb-6 h-auto bg-muted p-1 rounded-lg">
                  <TabsTrigger value="basic" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Basic</TabsTrigger>
                  <TabsTrigger value="details" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Details</TabsTrigger>
                  <TabsTrigger value="builder" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Builder</TabsTrigger>
                  <TabsTrigger value="media" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Media</TabsTrigger>
                  <TabsTrigger value="amenities" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Amenities</TabsTrigger>
                </TabsList>

                {/* ── Basic Tab ── */}
                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Project Name *</Label>
                      <Input
                        value={projForm.name}
                        onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                        placeholder="e.g., Pride Purple Park Eden"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Builder Name *</Label>
                      <Input
                        value={projForm.builderName}
                        onChange={(e) => setProjForm({ ...projForm, builderName: e.target.value })}
                        placeholder="e.g., Pride Group"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Project Status *</Label>
                      <Select
                        value={projForm.status}
                        onValueChange={(v) =>
                          setProjForm({ ...projForm, status: v as typeof projForm.status })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Upcoming">Upcoming / Pre-Launch</SelectItem>
                          <SelectItem value="Under Construction">Under Construction</SelectItem>
                          <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Configurations</Label>
                      <Input
                        value={projForm.configurations}
                        onChange={(e) => setProjForm({ ...projForm, configurations: e.target.value })}
                        placeholder="e.g., 2, 3 BHK"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label>Description *</Label>
                      <Textarea
                        value={projForm.description}
                        onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                        placeholder="Describe the project — highlights, amenities, location advantages..."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Badge (Optional)</Label>
                      <Select
                        value={projForm.badge || "none"}
                        onValueChange={(v) =>
                          setProjForm({ ...projForm, badge: v === "none" ? "" : v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select badge" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Badge</SelectItem>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="Big Discount">Big Discount</SelectItem>
                          <SelectItem value="Special Offer">Special Offer</SelectItem>
                          <SelectItem value="Hot Deal">Hot Deal</SelectItem>
                          <SelectItem value="Premium">Premium</SelectItem>
                          <SelectItem value="Best Seller">Best Seller</SelectItem>
                          <SelectItem value="Limited Units">Limited Units</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Custom Badge Text (Optional)</Label>
                      <Input
                        value={projForm.customBadgeText}
                        onChange={(e) =>
                          setProjForm({
                            ...projForm,
                            customBadgeText: e.target.value.slice(0, 25),
                          })
                        }
                        placeholder="e.g., Pre-Launch, Sold Out"
                        maxLength={25}
                      />
                      <p className="text-xs text-muted-foreground">Max 25 characters</p>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Details Tab ── */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Location *</Label>
                      <LocationAutocomplete
                        value={projForm.location}
                        onChange={(location, lat, lng) => {
                          setProjForm({
                            ...projForm,
                            location,
                            latitude: lat ?? null,
                            longitude: lng ?? null,
                          });
                        }}
                        placeholder="Search for location..."
                      />
                      {projForm.latitude && projForm.longitude && (
                        <p className="text-xs text-muted-foreground">
                          Coordinates: {projForm.latitude.toFixed(6)},{" "}
                          {projForm.longitude.toFixed(6)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        value={projForm.city}
                        onChange={(e) => setProjForm({ ...projForm, city: e.target.value })}
                        placeholder="e.g., Pune"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Price Range *</Label>
                      <Input
                        value={projForm.priceRange}
                        onChange={(e) => setProjForm({ ...projForm, priceRange: e.target.value })}
                        placeholder="e.g., ₹85L - ₹1.45Cr"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Min Price (for filtering)</Label>
                      <Input
                        type="number"
                        value={projForm.minPrice}
                        onChange={(e) => setProjForm({ ...projForm, minPrice: e.target.value })}
                        placeholder="e.g., 8500000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Price (for filtering)</Label>
                      <Input
                        type="number"
                        value={projForm.maxPrice}
                        onChange={(e) => setProjForm({ ...projForm, maxPrice: e.target.value })}
                        placeholder="e.g., 14500000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>RERA Number</Label>
                      <Input
                        value={projForm.reraNumber}
                        onChange={(e) => setProjForm({ ...projForm, reraNumber: e.target.value })}
                        placeholder="e.g., P52100054321"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Possession Date</Label>
                      <Input
                        type="date"
                        value={projForm.possessionDate}
                        onChange={(e) => setProjForm({ ...projForm, possessionDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Units</Label>
                      <Input
                        type="number"
                        value={projForm.totalUnits}
                        onChange={(e) => setProjForm({ ...projForm, totalUnits: e.target.value })}
                        placeholder="e.g., 500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Number of Towers</Label>
                      <Input
                        type="number"
                        value={projForm.towers}
                        onChange={(e) => setProjForm({ ...projForm, towers: e.target.value })}
                        placeholder="e.g., 5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Floors per Tower</Label>
                      <Input
                        type="number"
                        value={projForm.floors}
                        onChange={(e) => setProjForm({ ...projForm, floors: e.target.value })}
                        placeholder="e.g., 25"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ── Builder Tab ── */}
                <TabsContent value="builder" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label>Builder Description / History</Label>
                      <Textarea
                        value={projForm.builderDescription}
                        onChange={(e) =>
                          setProjForm({ ...projForm, builderDescription: e.target.value })
                        }
                        placeholder="About the builder, their history, achievements, etc."
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Builder Logo</Label>
                      <PublicSingleFileUpload
                        value={projForm.builderLogo}
                        onChange={(url) => setProjForm({ ...projForm, builderLogo: url })}
                        firebaseToken={verified.token}
                        accept="image/*"
                        placeholder="Upload builder logo or enter URL"
                        helpText="Builder logo image"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Year Established</Label>
                      <Input
                        type="number"
                        value={projForm.builderEstablished}
                        onChange={(e) =>
                          setProjForm({ ...projForm, builderEstablished: e.target.value })
                        }
                        placeholder="e.g., 1995"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Total Projects by Builder</Label>
                      <Input
                        type="number"
                        value={projForm.builderProjects}
                        onChange={(e) =>
                          setProjForm({ ...projForm, builderProjects: e.target.value })
                        }
                        placeholder="e.g., 50"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* ── Media Tab ── */}
                <TabsContent value="media" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Master Plan Image</Label>
                      <PublicSingleFileUpload
                        value={projForm.masterPlanUrl}
                        onChange={(url) => setProjForm({ ...projForm, masterPlanUrl: url })}
                        firebaseToken={verified.token}
                        accept="image/*"
                        placeholder="Upload master plan or enter URL"
                        helpText="Site layout/master plan image"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Main Video URL (YouTube)</Label>
                      <Input
                        value={projForm.videoUrl}
                        onChange={(e) => setProjForm({ ...projForm, videoUrl: e.target.value })}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-muted-foreground">
                        YouTube URL for main project video
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Brochure (PDF or Image)</Label>
                      <PublicSingleFileUpload
                        value={projForm.brochureUrl}
                        onChange={(url) => setProjForm({ ...projForm, brochureUrl: url })}
                        firebaseToken={verified.token}
                        accept="image/*,application/pdf"
                        placeholder="Upload brochure or enter URL"
                        helpText="Upload PDF or image brochure"
                      />
                    </div>
                  </div>

                  {/* Gallery Images */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-base font-semibold">
                      <ImageIcon className="h-4 w-4" />
                      Gallery Images (up to {MAX_IMAGES}, max {MAX_FILE_SIZE_MB} MB each)
                    </Label>
                    <PublicImageGallery
                      images={projImages}
                      onChange={setProjImages}
                      firebaseToken={verified.token}
                    />
                  </div>

                  {/* Additional Videos */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="flex items-center gap-2 text-base font-semibold">
                        <Video className="h-4 w-4" />
                        Additional Video URLs
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setProjVideos([
                            ...projVideos,
                            { videoUrl: "", videoType: "youtube", title: "" },
                          ])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add YouTube URL
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add YouTube video URLs for project tours, walkthroughs, etc.
                    </p>
                    {projVideos.map((video, index) => (
                      <div
                        key={index}
                        className="flex gap-2 items-start p-3 border rounded-lg bg-secondary/30"
                      >
                        <div className="flex-1 space-y-2">
                          <Input
                            value={video.videoUrl}
                            onChange={(e) => {
                              const nv = [...projVideos];
                              nv[index].videoUrl = e.target.value;
                              setProjVideos(nv);
                            }}
                            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                          />
                          <div className="flex gap-2">
                            <Input
                              value={video.title}
                              onChange={(e) => {
                                const nv = [...projVideos];
                                nv[index].title = e.target.value;
                                setProjVideos(nv);
                              }}
                              placeholder="Video title (e.g., Project Walkthrough)"
                              className="flex-1"
                            />
                            <Select
                              value={video.videoType}
                              onValueChange={(v) => {
                                const nv = [...projVideos];
                                nv[index].videoType = v as ProjectVideo["videoType"];
                                setProjVideos(nv);
                              }}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setProjVideos(projVideos.filter((_, i) => i !== index))
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {projVideos.length === 0 && (
                      <div className="text-center py-6 border-2 border-dashed rounded-lg">
                        <Video className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No additional videos added</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Amenities & Floor Plans Tab ── */}
                <TabsContent value="amenities" className="space-y-6">
                  {/* Amenities */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Amenities</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setAmenities([...amenities, { name: "", icon: "" }])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Amenity
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add amenities for the project
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {amenities.map((amenity, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex gap-2 items-center">
                            <Select
                              value={amenity.icon}
                              onValueChange={(value) => {
                                const na = [...amenities];
                                na[index].icon = value;
                                if (!na[index].name) {
                                  const iconInfo = AMENITY_ICONS.find(
                                    (i) => i.value === value
                                  );
                                  if (iconInfo) na[index].name = iconInfo.label;
                                }
                                setAmenities(na);
                              }}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue placeholder="Icon" />
                              </SelectTrigger>
                              <SelectContent>
                                {AMENITY_ICONS.map((icon) => (
                                  <SelectItem key={icon.value} value={icon.value}>
                                    {icon.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              value={amenity.name}
                              onChange={(e) => {
                                const na = [...amenities];
                                na[index].name = e.target.value;
                                setAmenities(na);
                              }}
                              placeholder="Amenity name"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setAmenities(amenities.filter((_, i) => i !== index))
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                    {amenities.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground">No amenities added yet</p>
                      </div>
                    )}
                  </div>

                  {/* Floor Plans */}
                  <div className="space-y-4 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Layers className="h-5 w-5" />
                        Floor Plans
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFloorPlans([
                            ...floorPlans,
                            { name: "", bedrooms: 2, bathrooms: 2, area: 0, price: 0 },
                          ])
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Floor Plan
                      </Button>
                    </div>
                    {floorPlans.map((plan, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="col-span-2">
                            <Label>Name</Label>
                            <Input
                              value={plan.name}
                              onChange={(e) => {
                                const np = [...floorPlans];
                                np[index].name = e.target.value;
                                setFloorPlans(np);
                              }}
                              placeholder="e.g., 2 BHK Classic"
                            />
                          </div>
                          <div>
                            <Label>Bedrooms</Label>
                            <Input
                              type="number"
                              value={plan.bedrooms}
                              onChange={(e) => {
                                const np = [...floorPlans];
                                np[index].bedrooms = parseInt(e.target.value) || 0;
                                setFloorPlans(np);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Bathrooms</Label>
                            <Input
                              type="number"
                              value={plan.bathrooms}
                              onChange={(e) => {
                                const np = [...floorPlans];
                                np[index].bathrooms = parseInt(e.target.value) || 0;
                                setFloorPlans(np);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Area (sq.ft)</Label>
                            <Input
                              type="number"
                              value={plan.area}
                              onChange={(e) => {
                                const np = [...floorPlans];
                                np[index].area = parseInt(e.target.value) || 0;
                                setFloorPlans(np);
                              }}
                            />
                          </div>
                          <div>
                            <Label>Price (₹)</Label>
                            <Input
                              type="number"
                              value={plan.price}
                              onChange={(e) => {
                                const np = [...floorPlans];
                                np[index].price = parseInt(e.target.value) || 0;
                                setFloorPlans(np);
                              }}
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setFloorPlans(floorPlans.filter((_, i) => i !== index))
                              }
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                    {floorPlans.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <Layers className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">No floor plans added yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                onClick={handleSubmitProject}
                disabled={isSubmitting}
                size="lg"
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Submit Project for Review
                  </>
                )}
              </Button>
              <Link href="/list-property">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-4 text-center">
          By submitting, you confirm that the information provided is accurate and you have the
          right to list this property.
        </p>
      </div>
    </div>
  );
}
