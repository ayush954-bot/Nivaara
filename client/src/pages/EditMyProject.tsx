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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Upload, Loader2, X } from "lucide-react";
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

interface VideoItem {
  url: string;
  type: string;
}

interface FloorPlanItem {
  name: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  price: string;
  imageUrl?: string;
}

interface AmenityItem {
  name: string;
  icon?: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function EditMyProject() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const projectId = parseInt(params.id ?? "0");

  const [session, setSession] = useState<VerifiedSession | null>(null);
  useEffect(() => {
    const stored = sessionStorage.getItem("nivaara_public_session");
    if (stored) {
      try { setSession(JSON.parse(stored)); } catch {}
    }
  }, []);

  const { data: proj, isLoading } = trpc.publicListing.getMyProjectById.useQuery(
    { firebaseToken: session?.token ?? "", id: projectId },
    { enabled: !!session?.token && projectId > 0 }
  );

  const uploadMutation = trpc.publicListing.uploadFile.useMutation();
  const updateMutation = trpc.publicListing.updateMyProject.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully.");
      navigate("/my-listings");
    },
    onError: (e) => toast.error(e.message),
  });

  // Basic fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Under Construction");
  const [city, setCity] = useState("Pune");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [configurations, setConfigurations] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [possessionDate, setPossessionDate] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [towers, setTowers] = useState("");
  const [floors, setFloors] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [badge, setBadge] = useState("none");
  const [customBadgeText, setCustomBadgeText] = useState("");
  // Builder fields
  const [builderName, setBuilderName] = useState("");
  const [builderDescription, setBuilderDescription] = useState("");
  const [builderLogo, setBuilderLogo] = useState("");
  const [builderEstablished, setBuilderEstablished] = useState("");
  // Media
  const [images, setImages] = useState<ImageItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([{ url: "", type: "youtube" }]);
  const [brochureUrl, setBrochureUrl] = useState("");
  const [masterPlanUrl, setMasterPlanUrl] = useState("");
  // Amenities & Floor Plans
  const [amenities, setAmenities] = useState<AmenityItem[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [floorPlans, setFloorPlans] = useState<FloorPlanItem[]>([]);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (proj && !initialized) {
      setName(proj.name ?? "");
      setDescription(proj.description ?? "");
      setStatus(proj.status ?? "Under Construction");
      setCity(proj.city ?? "Pune");
      setLocation(proj.location ?? "");
      setLatitude(proj.latitude ? parseFloat(String(proj.latitude)) : undefined);
      setLongitude(proj.longitude ? parseFloat(String(proj.longitude)) : undefined);
      setConfigurations(proj.configurations ?? "");
      setReraNumber(proj.reraNumber ?? "");
      setPossessionDate(proj.possessionDate ? String(proj.possessionDate).split("T")[0] : "");
      setTotalUnits(String(proj.totalUnits ?? ""));
      setTowers(String(proj.towers ?? ""));
      setFloors(String(proj.floors ?? ""));
      setMinPrice(String(proj.minPrice ?? ""));
      setMaxPrice(String(proj.maxPrice ?? ""));
      setBadge(proj.badge ?? "none");
      setCustomBadgeText(proj.customBadgeText ?? "");
      setBuilderName(proj.builderName ?? "");
      setBuilderDescription(proj.builderDescription ?? "");
      setBuilderLogo(proj.builderLogo ?? "");
      setBuilderEstablished(String(proj.builderEstablished ?? ""));
      setBrochureUrl(proj.brochureUrl ?? "");
      setMasterPlanUrl(proj.masterPlanUrl ?? "");
      if (proj.images?.length) setImages(proj.images.map((i: any) => ({ url: i.imageUrl })));
      if (proj.videos?.length) setVideos(proj.videos.map((v: any) => ({ url: v.videoUrl, type: v.videoType })));
      if (proj.amenities?.length) setAmenities(proj.amenities.map((a: any) => ({ name: a.name, icon: a.icon })));
      if (proj.floorPlans?.length) setFloorPlans(proj.floorPlans.map((fp: any) => ({
        name: fp.name,
        bedrooms: fp.bedrooms,
        bathrooms: fp.bathrooms,
        area: String(fp.area),
        price: String(fp.price),
        imageUrl: fp.imageUrl,
      })));
      setInitialized(true);
    }
  }, [proj, initialized]);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !session) return;
    const fileArr = Array.from(files).slice(0, 30 - images.length);
    for (const file of fileArr) {
      if (file.size > 10 * 1024 * 1024) { toast.error(`${file.name} exceeds 10 MB.`); continue; }
      setImages((prev) => [...prev, { url: "", isUploading: true }]);
      try {
        const base64 = await fileToBase64(file);
        const result = await uploadMutation.mutateAsync({ firebaseToken: session.token, fileName: file.name, mimeType: file.type, base64Data: base64 });
        setImages((prev) => { const idx = prev.findIndex((i) => i.isUploading); if (idx === -1) return prev; const next = [...prev]; next[idx] = { url: result.url }; return next; });
      } catch (e: any) {
        toast.error("Upload failed: " + e.message);
        setImages((prev) => prev.filter((i) => !i.isUploading));
      }
    }
  };

  const handleFileUpload = async (file: File, setter: (url: string) => void) => {
    if (!session) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("File exceeds 10 MB."); return; }
    try {
      const base64 = await fileToBase64(file);
      const result = await uploadMutation.mutateAsync({ firebaseToken: session.token, fileName: file.name, mimeType: file.type, base64Data: base64 });
      setter(result.url);
      toast.success("File uploaded.");
    } catch (e: any) {
      toast.error("Upload failed: " + e.message);
    }
  };

  const handleSubmit = () => {
    if (!session) return;
    const filteredVideos = videos.filter((v) => v.url.trim());
    updateMutation.mutate({
      firebaseToken: session.token,
      id: projectId,
      name: name || undefined,
      description: description || undefined,
      status: status || undefined,
      city: city || undefined,
      location: location || undefined,
      latitude,
      longitude,
      configurations: configurations || undefined,
      reraNumber: reraNumber || undefined,
      possessionDate: possessionDate || undefined,
      totalUnits: totalUnits ? parseInt(totalUnits) : undefined,
      towers: towers ? parseInt(towers) : undefined,
      floors: floors ? parseInt(floors) : undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      badge: badge !== "none" ? badge : undefined,
      customBadgeText: badge === "custom" ? customBadgeText : undefined,
      builderName: builderName || undefined,
      builderDescription: builderDescription || undefined,
      builderLogo: builderLogo || undefined,
      builderEstablished: builderEstablished ? parseInt(builderEstablished) : undefined,
      brochureUrl: brochureUrl || undefined,
      masterPlanUrl: masterPlanUrl || undefined,
      videoUrls: filteredVideos,
      imageUrls: images.filter((i) => !i.isUploading && i.url).map((i) => i.url),
      amenities: amenities.filter((a) => a.name.trim()),
      floorPlans: floorPlans.filter((fp) => fp.name.trim()),
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
    return <div className="container py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!proj) {
    return (
      <div className="container py-16 text-center">
        <p className="text-muted-foreground mb-4">Project not found or you don't have access.</p>
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
        <h1 className="text-2xl font-bold">Edit Project</h1>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6 flex-wrap h-auto">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="amenities">Amenities</TabsTrigger>
          <TabsTrigger value="floorplans">Floor Plans</TabsTrigger>
        </TabsList>

        {/* Basic Info */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Project Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pride Purple Park Eden" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Upcoming">Upcoming</SelectItem>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                      <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                      <SelectItem value="Sold Out">Sold Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Pune" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Location / Address</Label>
                <LocationAutocomplete
                  value={location}
                  onChange={(val, lat, lng) => { setLocation(val); if (lat !== undefined) setLatitude(lat); if (lng !== undefined) setLongitude(lng); }}
                  placeholder="Search location..."
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe the project..." />
              </div>
              <div className="space-y-1">
                <Label>Badge</Label>
                <div className="flex gap-3">
                  <Select value={badge} onValueChange={setBadge}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Badge</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="hot">Hot Deal</SelectItem>
                      <SelectItem value="new">New Launch</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="sold">Sold Out</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  {badge === "custom" && (
                    <Input value={customBadgeText} onChange={(e) => setCustomBadgeText(e.target.value)} placeholder="Custom badge text" maxLength={25} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Details */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Configurations</Label>
                  <Input value={configurations} onChange={(e) => setConfigurations(e.target.value)} placeholder="e.g. 2, 3 BHK" />
                </div>
                <div className="space-y-1">
                  <Label>RERA Number</Label>
                  <Input value={reraNumber} onChange={(e) => setReraNumber(e.target.value)} placeholder="e.g. P52100012345" />
                </div>
                <div className="space-y-1">
                  <Label>Possession Date</Label>
                  <Input type="date" value={possessionDate} onChange={(e) => setPossessionDate(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Total Units</Label>
                  <Input type="number" value={totalUnits} onChange={(e) => setTotalUnits(e.target.value)} placeholder="e.g. 240" />
                </div>
                <div className="space-y-1">
                  <Label>Towers / Buildings</Label>
                  <Input type="number" value={towers} onChange={(e) => setTowers(e.target.value)} placeholder="e.g. 4" />
                </div>
                <div className="space-y-1">
                  <Label>Floors per Tower</Label>
                  <Input type="number" value={floors} onChange={(e) => setFloors(e.target.value)} placeholder="e.g. 18" />
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Min Price (₹)</Label>
                  <Input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="e.g. 8500000" />
                </div>
                <div className="space-y-1">
                  <Label>Max Price (₹)</Label>
                  <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="e.g. 14500000" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Builder */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Builder / Developer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label>Builder Name</Label>
                <Input value={builderName} onChange={(e) => setBuilderName(e.target.value)} placeholder="e.g. Pride Group" />
              </div>
              <div className="space-y-1">
                <Label>Builder Description</Label>
                <Textarea value={builderDescription} onChange={(e) => setBuilderDescription(e.target.value)} rows={3} placeholder="About the builder..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Year Established</Label>
                  <Input type="number" value={builderEstablished} onChange={(e) => setBuilderEstablished(e.target.value)} placeholder="e.g. 1995" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Builder Logo</Label>
                {builderLogo && (
                  <div className="flex items-center gap-2 mb-2">
                    <img src={builderLogo} alt="Builder logo" className="h-12 object-contain border rounded p-1" />
                    <Button variant="ghost" size="sm" onClick={() => setBuilderLogo("")}>Remove</Button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-4 w-4 mr-1" />Upload Logo</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setBuilderLogo)} />
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                    {img.isUploading ? (
                      <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : (
                      <>
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600">×</button>
                      </>
                    )}
                  </div>
                ))}
                {images.length < 30 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add Photo</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageUpload(e.target.files)} />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Max 30 photos, 10 MB each.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Video Links</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {videos.map((v, idx) => (
                <div key={idx} className="flex gap-2">
                  <Select value={v.type} onValueChange={(val) => { const next = [...videos]; next[idx] = { ...next[idx], type: val }; setVideos(next); }}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vimeo">Vimeo</SelectItem>
                      <SelectItem value="virtual_tour">Virtual Tour</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input value={v.url} onChange={(e) => { const next = [...videos]; next[idx] = { ...next[idx], url: e.target.value }; setVideos(next); }} placeholder="Video URL" />
                  <Button variant="ghost" size="icon" onClick={() => setVideos((prev) => prev.filter((_, i) => i !== idx))} disabled={videos.length === 1}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={() => setVideos((prev) => [...prev, { url: "", type: "youtube" }])}>
                <Plus className="h-4 w-4 mr-1" /> Add Video
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Brochure (PDF)</Label>
                {brochureUrl && (
                  <div className="flex items-center gap-2">
                    <a href={brochureUrl} target="_blank" rel="noopener noreferrer" className="text-primary text-sm underline">View current brochure</a>
                    <Button variant="ghost" size="sm" onClick={() => setBrochureUrl("")}>Remove</Button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-4 w-4 mr-1" />Upload Brochure</span>
                  </Button>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setBrochureUrl)} />
                </label>
              </div>
              <div className="space-y-2">
                <Label>Master Plan Image</Label>
                {masterPlanUrl && (
                  <div className="flex items-center gap-2 mb-2">
                    <img src={masterPlanUrl} alt="Master plan" className="h-20 object-contain border rounded" />
                    <Button variant="ghost" size="sm" onClick={() => setMasterPlanUrl("")}>Remove</Button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span><Upload className="h-4 w-4 mr-1" />Upload Master Plan</span>
                  </Button>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setMasterPlanUrl)} />
                </label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Amenities */}
        <TabsContent value="amenities" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="e.g. Swimming Pool, Gym, Clubhouse"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newAmenity.trim()) {
                      setAmenities((prev) => [...prev, { name: newAmenity.trim() }]);
                      setNewAmenity("");
                    }
                  }}
                />
                <Button onClick={() => { if (newAmenity.trim()) { setAmenities((prev) => [...prev, { name: newAmenity.trim() }]); setNewAmenity(""); } }}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {amenities.map((a, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                    {a.name}
                    <button onClick={() => setAmenities((prev) => prev.filter((_, i) => i !== idx))} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {amenities.length === 0 && <p className="text-sm text-muted-foreground">No amenities added yet.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Floor Plans */}
        <TabsContent value="floorplans" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Floor Plans / Configurations</CardTitle>
                <Button size="sm" onClick={() => setFloorPlans((prev) => [...prev, { name: "", bedrooms: 2, bathrooms: 2, area: "", price: "" }])}>
                  <Plus className="h-4 w-4 mr-1" /> Add Configuration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {floorPlans.length === 0 && <p className="text-sm text-muted-foreground">No floor plans added yet.</p>}
              {floorPlans.map((fp, idx) => (
                <div key={idx} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Configuration {idx + 1}</h4>
                    <Button variant="ghost" size="icon" onClick={() => setFloorPlans((prev) => prev.filter((_, i) => i !== idx))}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <Label>Name</Label>
                      <Input value={fp.name} onChange={(e) => { const next = [...floorPlans]; next[idx] = { ...next[idx], name: e.target.value }; setFloorPlans(next); }} placeholder="e.g. 2 BHK - Type A" />
                    </div>
                    <div className="space-y-1">
                      <Label>Bedrooms</Label>
                      <Input type="number" value={fp.bedrooms} onChange={(e) => { const next = [...floorPlans]; next[idx] = { ...next[idx], bedrooms: parseInt(e.target.value) || 0 }; setFloorPlans(next); }} />
                    </div>
                    <div className="space-y-1">
                      <Label>Bathrooms</Label>
                      <Input type="number" value={fp.bathrooms} onChange={(e) => { const next = [...floorPlans]; next[idx] = { ...next[idx], bathrooms: parseInt(e.target.value) || 0 }; setFloorPlans(next); }} />
                    </div>
                    <div className="space-y-1">
                      <Label>Area (sq ft)</Label>
                      <Input value={fp.area} onChange={(e) => { const next = [...floorPlans]; next[idx] = { ...next[idx], area: e.target.value }; setFloorPlans(next); }} placeholder="e.g. 1050" />
                    </div>
                    <div className="space-y-1">
                      <Label>Starting Price (₹)</Label>
                      <Input value={fp.price} onChange={(e) => { const next = [...floorPlans]; next[idx] = { ...next[idx], price: e.target.value }; setFloorPlans(next); }} placeholder="e.g. 8500000" />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-6" />
      <div className="flex gap-3 justify-end pb-8">
        <Button variant="outline" asChild>
          <Link href="/my-listings">Cancel</Link>
        </Button>
        <Button onClick={handleSubmit} disabled={updateMutation.isPending || !name}>
          {updateMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
