import { useState } from "react";
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
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  CheckCircle2,
  Upload,
  X,
  ArrowLeft,
  Home,
  Building2,
  Clock,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

type ListingType = "property" | "project";
type VerifiedState = { phone: string; token: string } | null;

const MAX_FILE_SIZE_MB = 10;
const MAX_FILES = 10;

interface UploadedFile {
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: string;
}

export default function ListPropertySubmit() {
  const [verified, setVerified] = useState<VerifiedState>(null);
  const [submitterName, setSubmitterName] = useState("");
  const [listingType, setListingType] = useState<ListingType>("property");
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);

  // Property form state
  const [propForm, setPropForm] = useState<{
    title: string;
    description: string;
    propertyType: "Flat" | "Shop" | "Office" | "Land" | "Rental" | "Bank Auction" | "";
    status: "Under-Construction" | "Ready" | "";
    location: string;
    area: string;
    price: string;
    bedrooms: string;
    bathrooms: string;
    area_sqft: string;
    builder: string;
  }>({
    title: "",
    description: "",
    propertyType: "",
    status: "",
    location: "",
    area: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    builder: "",
  });

  // Project form state
  const [projForm, setProjForm] = useState<{
    name: string;
    builderName: string;
    description: string;
    location: string;
    city: string;
    status: "Upcoming" | "Under Construction" | "Ready to Move" | "";
    priceRange: string;
    configurations: string;
    reraNumber: string;
    totalUnits: string;
  }>({
    name: "",
    builderName: "",
    description: "",
    location: "",
    city: "Pune",
    status: "",
    priceRange: "",
    configurations: "",
    reraNumber: "",
    totalUnits: "",
  });

  const submitPropertyMutation = trpc.publicListing.submitProperty.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message?: string }) => toast.error(err.message || "Submission failed. Please try again."),
  });

  const submitProjectMutation = trpc.publicListing.submitProject.useMutation({
    onSuccess: () => setSubmitted(true),
    onError: (err: { message?: string }) => toast.error(err.message || "Submission failed. Please try again."),
  });

  const uploadFileMutation = trpc.publicListing.uploadFile.useMutation();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remaining = MAX_FILES - uploadedFiles.filter((f) => f.url).length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_FILES} images allowed.`);
      return;
    }

    const toProcess = files.slice(0, remaining);
    const oversized = toProcess.filter((f) => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (oversized.length) {
      toast.error(`${oversized.length} file(s) exceed the ${MAX_FILE_SIZE_MB} MB limit and were skipped.`);
    }

    const valid = toProcess.filter((f) => f.size <= MAX_FILE_SIZE_MB * 1024 * 1024);
    if (!valid.length) return;

    const newEntries: UploadedFile[] = valid.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
    }));

    setUploadedFiles((prev) => [...prev, ...newEntries]);
    setUploading(true);

    for (let i = 0; i < newEntries.length; i++) {
      const entry = newEntries[i];
      try {
        const arrayBuffer = await entry.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let b = 0; b < bytes.byteLength; b++) binary += String.fromCharCode(bytes[b]);
        const base64 = btoa(binary);
        const result = await uploadFileMutation.mutateAsync({
          fileName: entry.file.name,
          mimeType: entry.file.type,
          base64Data: base64,
          firebaseToken: verified!.token,
        });
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.preview === entry.preview
              ? { ...f, uploading: false, url: result.url }
              : f
          )
        );
      } catch {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.preview === entry.preview
              ? { ...f, uploading: false, error: "Upload failed" }
              : f
          )
        );
      }
    }
    setUploading(false);
    // Reset input
    e.target.value = "";
  };

  const removeFile = (preview: string) => {
    setUploadedFiles((prev) => {
      const entry = prev.find((f) => f.preview === preview);
      if (entry) URL.revokeObjectURL(entry.preview);
      return prev.filter((f) => f.preview !== preview);
    });
  };

  const handleSubmit = async () => {
    if (!verified) return;
    if (!submitterName.trim()) {
      toast.error("Please enter your name.");
      return;
    }

    const imageUrls = uploadedFiles.filter((f) => f.url).map((f) => f.url!);

    if (listingType === "property") {
      if (!propForm.title || !propForm.propertyType || !propForm.status || !propForm.location || !propForm.price) {
        toast.error("Please fill in all required fields.");
        return;
      }
      submitPropertyMutation.mutate({
        title: propForm.title,
        description: propForm.description,
        propertyType: propForm.propertyType,
        status: propForm.status,
        location: propForm.location,
        price: parseFloat(propForm.price),
        bedrooms: propForm.bedrooms ? parseInt(propForm.bedrooms) : undefined,
        bathrooms: propForm.bathrooms ? parseInt(propForm.bathrooms) : undefined,
        area_sqft: propForm.area_sqft ? parseInt(propForm.area_sqft) : undefined,
        builder: propForm.builder || undefined,
        imageUrls,
        submitterPhone: verified.phone,
        submitterName,
        firebaseToken: verified.token,
      });
    } else {
      if (!projForm.name || !projForm.builderName || !projForm.location || !projForm.status || !projForm.priceRange) {
        toast.error("Please fill in all required fields.");
        return;
      }
      if (!projForm.status) return;
      submitProjectMutation.mutate({
        name: projForm.name,
        builderName: projForm.builderName,
        description: projForm.description,
        location: projForm.location,
        city: projForm.city,
        status: projForm.status as "Upcoming" | "Under Construction" | "Ready to Move",
        priceRange: projForm.priceRange,
        configurations: projForm.configurations || undefined,
        reraNumber: projForm.reraNumber || undefined,
        totalUnits: projForm.totalUnits ? parseInt(projForm.totalUnits) : undefined,
        imageUrls,
        submitterPhone: verified.phone,
        submitterName,
        firebaseToken: verified.token,
      });
    }
  };

  // ─── Success screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Listing Submitted!</h1>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Thank you for listing with Nivaara. Our team will review your submission within <strong>30 minutes</strong>. Once approved, your listing will go live on the website.
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

  // ─── OTP gate ─────────────────────────────────────────────────────────────
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
            onVerified={(phone, token) => setVerified({ phone, token })}
          />
        </div>
      </div>
    );
  }

  // ─── Submission form ──────────────────────────────────────────────────────
  const isSubmitting = submitPropertyMutation.isPending || submitProjectMutation.isPending;

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50">
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
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Details</h2>
          <div>
            <Label htmlFor="submitterName">Your Name *</Label>
            <Input
              id="submitterName"
              placeholder="Enter your full name"
              value={submitterName}
              onChange={(e) => setSubmitterName(e.target.value)}
              className="mt-1.5 text-foreground"
            />
          </div>
        </div>

        {/* Listing type toggle */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">What are you listing?</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "property", label: "Individual Property", icon: Home, desc: "Flat, Shop, Land, Rental" },
              { value: "project", label: "Builder Project", icon: Building2, desc: "New launch, Township" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setListingType(opt.value as ListingType)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                  listingType === opt.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <opt.icon className={`h-6 w-6 ${listingType === opt.value ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className="font-medium text-sm text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Property Form */}
        {listingType === "property" && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Property Details</h2>

            <div>
              <Label>Title *</Label>
              <Input
                placeholder="e.g. 2 BHK Flat in Kharadi"
                value={propForm.title}
                onChange={(e) => setPropForm({ ...propForm, title: e.target.value })}
                className="mt-1.5 text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Property Type *</Label>
                <Select value={propForm.propertyType} onValueChange={(v) => setPropForm({ ...propForm, propertyType: v as "Flat" | "Shop" | "Office" | "Land" | "Rental" | "Bank Auction" })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flat">Flat / Apartment</SelectItem>
                    <SelectItem value="Shop">Shop</SelectItem>
                    <SelectItem value="Office">Office</SelectItem>
                    <SelectItem value="Land">Land / Plot</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                    <SelectItem value="Bank Auction">Bank Auction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status *</Label>
                <Select value={propForm.status} onValueChange={(v) => setPropForm({ ...propForm, status: v as "Under-Construction" | "Ready" })}>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Location / Area *</Label>
                <Input
                  placeholder="e.g. Kharadi, Pune"
                  value={propForm.location}
                  onChange={(e) => setPropForm({ ...propForm, location: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  placeholder="e.g. 4500000"
                  value={propForm.price}
                  onChange={(e) => setPropForm({ ...propForm, price: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Bedrooms</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={propForm.bedrooms}
                  onChange={(e) => setPropForm({ ...propForm, bedrooms: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={propForm.bathrooms}
                  onChange={(e) => setPropForm({ ...propForm, bathrooms: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Area (sq ft)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 950"
                  value={propForm.area_sqft}
                  onChange={(e) => setPropForm({ ...propForm, area_sqft: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
            </div>

            <div>
              <Label>Builder / Society Name</Label>
              <Input
                placeholder="e.g. Kolte-Patil, Godrej"
                value={propForm.builder}
                onChange={(e) => setPropForm({ ...propForm, builder: e.target.value })}
                className="mt-1.5 text-foreground"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the property — highlights, amenities, nearby landmarks..."
                value={propForm.description}
                onChange={(e) => setPropForm({ ...propForm, description: e.target.value })}
                className="mt-1.5 text-foreground min-h-[120px]"
              />
            </div>
          </div>
        )}

        {/* Project Form */}
        {listingType === "project" && (
          <div className="bg-card border border-border rounded-xl p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Project Details</h2>

            <div>
              <Label>Project Name *</Label>
              <Input
                placeholder="e.g. Pride Purple Park Eden"
                value={projForm.name}
                onChange={(e) => setProjForm({ ...projForm, name: e.target.value })}
                className="mt-1.5 text-foreground"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Builder / Developer Name *</Label>
                <Input
                  placeholder="e.g. Pride Group"
                  value={projForm.builderName}
                  onChange={(e) => setProjForm({ ...projForm, builderName: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Status *</Label>
                <Select value={projForm.status} onValueChange={(v) => setProjForm({ ...projForm, status: v as "Upcoming" | "Under Construction" | "Ready to Move" })}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Upcoming">Upcoming / Pre-Launch</SelectItem>
                    <SelectItem value="Under Construction">Under Construction</SelectItem>
                    <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input
                  placeholder="e.g. Kharadi"
                  value={projForm.location}
                  onChange={(e) => setProjForm({ ...projForm, location: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>City *</Label>
                <Input
                  placeholder="e.g. Pune"
                  value={projForm.city}
                  onChange={(e) => setProjForm({ ...projForm, city: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Price Range *</Label>
                <Input
                  placeholder="e.g. ₹85L - ₹1.45Cr"
                  value={projForm.priceRange}
                  onChange={(e) => setProjForm({ ...projForm, priceRange: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Configurations</Label>
                <Input
                  placeholder="e.g. 2, 3 BHK"
                  value={projForm.configurations}
                  onChange={(e) => setProjForm({ ...projForm, configurations: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>RERA Number</Label>
                <Input
                  placeholder="e.g. P52100012345"
                  value={projForm.reraNumber}
                  onChange={(e) => setProjForm({ ...projForm, reraNumber: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
              <div>
                <Label>Total Units</Label>
                <Input
                  type="number"
                  placeholder="e.g. 200"
                  value={projForm.totalUnits}
                  onChange={(e) => setProjForm({ ...projForm, totalUnits: e.target.value })}
                  className="mt-1.5 text-foreground"
                />
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                placeholder="Describe the project — highlights, amenities, location advantages..."
                value={projForm.description}
                onChange={(e) => setProjForm({ ...projForm, description: e.target.value })}
                className="mt-1.5 text-foreground min-h-[120px]"
              />
            </div>
          </div>
        )}

        {/* Photo Upload */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">Photos</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Up to {MAX_FILES} photos · Max {MAX_FILE_SIZE_MB} MB each · JPG, PNG, WebP
          </p>

          {/* Upload zone */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-secondary/20 transition-colors">
            <Upload className="h-6 w-6 text-muted-foreground mb-2" />
            <span className="text-sm text-muted-foreground">Click to upload photos</span>
            <span className="text-xs text-muted-foreground mt-1">or drag and drop</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploadedFiles.filter((f) => f.url).length >= MAX_FILES}
            />
          </label>

          {/* Preview grid */}
          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
              {uploadedFiles.map((f) => (
                <div key={f.preview} className="relative aspect-square rounded-lg overflow-hidden border border-border bg-secondary/20">
                  <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                  {f.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                  {f.error && (
                    <div className="absolute inset-0 bg-red-900/70 flex items-center justify-center">
                      <span className="text-white text-xs text-center px-1">Failed</span>
                    </div>
                  )}
                  {!f.uploading && !f.error && (
                    <button
                      onClick={() => removeFile(f.preview)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  )}
                  {f.url && (
                    <div className="absolute bottom-1 left-1">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || uploading}
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
                Submit for Review
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

        <p className="text-xs text-muted-foreground mt-4 text-center">
          By submitting, you confirm that the information provided is accurate and you have the right to list this property.
        </p>
      </div>
    </div>
  );
}
