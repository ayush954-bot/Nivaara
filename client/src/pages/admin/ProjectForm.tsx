import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Plus, 
  Trash2, 
  Building2,
  Star,
  Layers,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { ImageUpload } from "@/components/ImageUpload";
import { GalleryImageUpload } from "@/components/GalleryImageUpload";
import { toast } from "sonner";

// Common amenity icons
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

export default function ProjectForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const projectId = params.id ? parseInt(params.id) : null;
  const isEdit = !!projectId;

  const { user, isLoading: authLoading, canManageProperties } = useAuth();
  
  // Fetch project data for edit mode
  const { data: project } = trpc.projects.getById.useQuery(
    { id: projectId! },
    { enabled: isEdit && !!projectId }
  );

  // Fetch existing related data for edit mode
  const { data: existingAmenities = [] } = trpc.admin.projects.amenities.list.useQuery(
    { projectId: projectId! },
    { enabled: isEdit && !!projectId }
  );

  const { data: existingFloorPlans = [] } = trpc.admin.projects.floorPlans.list.useQuery(
    { projectId: projectId! },
    { enabled: isEdit && !!projectId }
  );

  const { data: existingImages = [] } = trpc.admin.projects.images.list.useQuery(
    { projectId: projectId! },
    { enabled: isEdit && !!projectId }
  );

  const { data: existingVideos = [] } = trpc.admin.projects.videos.list.useQuery(
    { projectId: projectId! },
    { enabled: isEdit && !!projectId }
  );

  // Mutations
  const createProject = trpc.admin.projects.create.useMutation({
    onSuccess: (data) => {
      toast.success("Project created successfully!");
      saveRelatedData(data.id);
    },
    onError: (error) => {
      toast.error(`Failed to create project: ${error.message}`);
    },
  });

  const updateProject = trpc.admin.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully!");
      saveRelatedData(projectId!);
    },
    onError: (error) => {
      toast.error(`Failed to update project: ${error.message}`);
    },
  });

  // Related data mutations
  const deleteAllAmenities = trpc.admin.projects.amenities.deleteAll.useMutation();
  const addAmenity = trpc.admin.projects.amenities.add.useMutation();
  const deleteAllFloorPlans = trpc.admin.projects.floorPlans.deleteAll.useMutation();
  const addFloorPlan = trpc.admin.projects.floorPlans.add.useMutation();
  const deleteAllImages = trpc.admin.projects.images.deleteAll.useMutation();
  const addImage = trpc.admin.projects.images.add.useMutation();
  const deleteAllVideos = trpc.admin.projects.videos.deleteAll.useMutation();
  const addVideo = trpc.admin.projects.videos.add.useMutation();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    builderName: "",
    description: "",
    location: "",
    city: "Pune",
    latitude: null as number | null,
    longitude: null as number | null,
    status: "Under Construction" as "Upcoming" | "Under Construction" | "Ready to Move",
    priceRange: "",
    minPrice: "",
    maxPrice: "",
    configurations: "",
    reraNumber: "",
    possessionDate: "",
    totalUnits: "",
    towers: "",
    floors: "",
    coverImage: "",
    videoUrl: "",
    brochureUrl: "",
    masterPlanUrl: "",
    builderDescription: "",
    builderLogo: "",
    builderEstablished: "",
    builderProjects: "",
    featured: false,
    badge: "",
    customBadgeText: "",
  });

  // Related data state
  const [amenities, setAmenities] = useState<Array<{ name: string; icon: string; imageUrl: string }>>([]);
  const [floorPlans, setFloorPlans] = useState<Array<{
    name: string;
    bedrooms: number;
    bathrooms: number;
    area: number;
    price: number;
    imageUrl: string;
  }>>([]);
  const [images, setImages] = useState<Array<{ imageUrl: string; caption: string }>>([]);
  const [videos, setVideos] = useState<Array<{ videoUrl: string; videoType: string; title: string }>>([]);

  // Load existing data in edit mode
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        builderName: project.builderName,
        description: project.description,
        location: project.location,
        city: project.city,
        latitude: project.latitude ? parseFloat(project.latitude.toString()) : null,
        longitude: project.longitude ? parseFloat(project.longitude.toString()) : null,
        status: project.status,
        priceRange: project.priceRange,
        minPrice: project.minPrice?.toString() || "",
        maxPrice: project.maxPrice?.toString() || "",
        configurations: project.configurations || "",
        reraNumber: project.reraNumber || "",
        possessionDate: project.possessionDate ? new Date(project.possessionDate).toISOString().split('T')[0] : "",
        totalUnits: project.totalUnits?.toString() || "",
        towers: project.towers?.toString() || "",
        floors: project.floors?.toString() || "",
        coverImage: project.coverImage || "",
        videoUrl: project.videoUrl || "",
        brochureUrl: project.brochureUrl || "",
        masterPlanUrl: project.masterPlanUrl || "",
        builderDescription: project.builderDescription || "",
        builderLogo: project.builderLogo || "",
        builderEstablished: project.builderEstablished?.toString() || "",
        builderProjects: project.builderProjects?.toString() || "",
        featured: project.featured,
        badge: project.badge || "",
        customBadgeText: project.customBadgeText || "",
      });
    }
  }, [project]);

  useEffect(() => {
    if (existingAmenities.length > 0) {
      setAmenities(existingAmenities.map(a => ({ name: a.name, icon: a.icon || "", imageUrl: a.imageUrl || "" })));
    }
  }, [existingAmenities]);

  useEffect(() => {
    if (existingFloorPlans.length > 0) {
      setFloorPlans(existingFloorPlans.map(fp => ({
        name: fp.name,
        bedrooms: fp.bedrooms,
        bathrooms: fp.bathrooms,
        area: fp.area,
        price: parseFloat(fp.price?.toString() || "0"),
        imageUrl: fp.imageUrl || "",
      })));
    }
  }, [existingFloorPlans]);

  useEffect(() => {
    if (existingImages.length > 0) {
      setImages(existingImages.map(img => ({ imageUrl: img.imageUrl, caption: img.caption || "" })));
    }
  }, [existingImages]);

  useEffect(() => {
    if (existingVideos.length > 0) {
      setVideos(existingVideos.map(v => ({ 
        videoUrl: v.videoUrl, 
        videoType: v.videoType || "youtube", 
        title: v.title || "" 
      })));
    }
  }, [existingVideos]);

  const saveRelatedData = async (projectIdToUse: number) => {
    try {
      // Save amenities
      await deleteAllAmenities.mutateAsync({ projectId: projectIdToUse });
      for (let i = 0; i < amenities.length; i++) {
        if (amenities[i].name) {
          await addAmenity.mutateAsync({
            projectId: projectIdToUse,
            name: amenities[i].name,
            icon: amenities[i].icon,
            displayOrder: i,
          });
        }
      }

      // Save floor plans
      await deleteAllFloorPlans.mutateAsync({ projectId: projectIdToUse });
      for (let i = 0; i < floorPlans.length; i++) {
        if (floorPlans[i].name) {
          await addFloorPlan.mutateAsync({
            projectId: projectIdToUse,
            name: floorPlans[i].name,
            bedrooms: floorPlans[i].bedrooms,
            bathrooms: floorPlans[i].bathrooms,
            area: floorPlans[i].area,
            price: floorPlans[i].price,
            imageUrl: floorPlans[i].imageUrl,
            displayOrder: i,
          });
        }
      }

      // Save images
      await deleteAllImages.mutateAsync({ projectId: projectIdToUse });
      for (let i = 0; i < images.length; i++) {
        if (images[i].imageUrl) {
          await addImage.mutateAsync({
            projectId: projectIdToUse,
            imageUrl: images[i].imageUrl,
            caption: images[i].caption,
            displayOrder: i,
          });
        }
      }

      // Save videos
      await deleteAllVideos.mutateAsync({ projectId: projectIdToUse });
      for (let i = 0; i < videos.length; i++) {
        if (videos[i].videoUrl) {
          await addVideo.mutateAsync({
            projectId: projectIdToUse,
            videoUrl: videos[i].videoUrl,
            videoType: videos[i].videoType as "youtube" | "vimeo" | "virtual_tour" | "other",
            title: videos[i].title,
            displayOrder: i,
          });
        }
      }

      setLocation("/admin/dashboard");
    } catch (error) {
      console.error("Error saving related data:", error);
      toast.error("Failed to save some related data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name || !formData.builderName || !formData.description || !formData.location || !formData.priceRange) {
      toast.error("Please fill in all required fields");
      return;
    }

    const data = {
      name: formData.name,
      builderName: formData.builderName,
      description: formData.description,
      location: formData.location,
      city: formData.city,
      latitude: formData.latitude,
      longitude: formData.longitude,
      status: formData.status,
      priceRange: formData.priceRange,
      minPrice: formData.minPrice ? parseFloat(formData.minPrice) : undefined,
      maxPrice: formData.maxPrice ? parseFloat(formData.maxPrice) : undefined,
      configurations: formData.configurations || undefined,
      reraNumber: formData.reraNumber || undefined,
      possessionDate: formData.possessionDate || undefined,
      totalUnits: formData.totalUnits ? parseInt(formData.totalUnits) : undefined,
      towers: formData.towers ? parseInt(formData.towers) : undefined,
      floors: formData.floors ? parseInt(formData.floors) : undefined,
      coverImage: formData.coverImage || undefined,
      videoUrl: formData.videoUrl || undefined,
      brochureUrl: formData.brochureUrl || undefined,
      masterPlanUrl: formData.masterPlanUrl || undefined,
      builderDescription: formData.builderDescription || undefined,
      builderLogo: formData.builderLogo || undefined,
      builderEstablished: formData.builderEstablished ? parseInt(formData.builderEstablished) : undefined,
      builderProjects: formData.builderProjects ? parseInt(formData.builderProjects) : undefined,
      featured: formData.featured,
      badge: formData.badge || undefined,
      customBadgeText: formData.customBadgeText || undefined,
    };

    if (isEdit && projectId) {
      await updateProject.mutateAsync({ id: projectId, ...data });
    } else {
      await createProject.mutateAsync(data);
    }
  };

  // Loading state
  if (authLoading) {
    return <div className="container py-16 text-center">Loading...</div>;
  }

  // Auth check - allow both admin and staff with property_manager role
  if (!canManageProperties) {
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
              You don't have permission to manage projects. Please sign in as admin or staff.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/admin/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {isEdit ? "Edit Project" : "Add New Project"}
          </CardTitle>
          <CardDescription>
            {isEdit ? "Update project details and related information" : "Create a new builder project listing"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="flex flex-wrap justify-center gap-1 mb-6 h-auto bg-muted p-1 rounded-lg">
                <TabsTrigger value="basic" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Basic</TabsTrigger>
                <TabsTrigger value="details" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Details</TabsTrigger>
                <TabsTrigger value="builder" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Builder</TabsTrigger>
                <TabsTrigger value="media" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Media</TabsTrigger>
                <TabsTrigger value="amenities" className="text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background">Amenities</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Pride Purple Park Eden"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="builderName">Builder Name *</Label>
                    <Input
                      id="builderName"
                      value={formData.builderName}
                      onChange={(e) => setFormData({ ...formData, builderName: e.target.value })}
                      placeholder="e.g., Pride Group"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Project Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Upcoming">Upcoming</SelectItem>
                        <SelectItem value="Under Construction">Under Construction</SelectItem>
                        <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="configurations">Configurations</Label>
                    <Input
                      id="configurations"
                      value={formData.configurations}
                      onChange={(e) => setFormData({ ...formData, configurations: e.target.value })}
                      placeholder="e.g., 2, 3, 4 BHK"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed project description..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, featured: !!checked })}
                    />
                    <Label htmlFor="featured" className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500" />
                      Featured Project
                    </Label>
                  </div>

                  {/* Badge Management */}
                  <div className="space-y-2">
                    <Label htmlFor="badge">Project Badge (Optional)</Label>
                    <Select
                      value={formData.badge || "none"}
                      onValueChange={(value) =>
                        setFormData({ ...formData, badge: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger id="badge">
                        <SelectValue placeholder="Select badge or leave empty" />
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
                    <Label htmlFor="customBadgeText">Custom Badge Text (Optional)</Label>
                    <Input
                      id="customBadgeText"
                      value={formData.customBadgeText}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 25);
                        setFormData({ ...formData, customBadgeText: value });
                      }}
                      placeholder="e.g., Pre-Launch, Sold Out"
                      maxLength={25}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add custom badge text (max 25 characters)
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Location *</Label>
                    <LocationAutocomplete
                      value={formData.location}
                      onChange={(location, lat, lng) => {
                        setFormData({
                          ...formData,
                          location,
                          latitude: lat ?? null,
                          longitude: lng ?? null,
                        });
                      }}
                      placeholder="Search for location..."
                    />
                    {formData.latitude && formData.longitude && (
                      <p className="text-xs text-muted-foreground">
                        Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g., Pune"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceRange">Price Range *</Label>
                    <Input
                      id="priceRange"
                      value={formData.priceRange}
                      onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                      placeholder="e.g., ₹85L - ₹1.45Cr"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minPrice">Min Price (for filtering)</Label>
                    <Input
                      id="minPrice"
                      type="number"
                      value={formData.minPrice}
                      onChange={(e) => setFormData({ ...formData, minPrice: e.target.value })}
                      placeholder="e.g., 8500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPrice">Max Price (for filtering)</Label>
                    <Input
                      id="maxPrice"
                      type="number"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value })}
                      placeholder="e.g., 14500000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reraNumber">RERA Number</Label>
                    <Input
                      id="reraNumber"
                      value={formData.reraNumber}
                      onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
                      placeholder="e.g., P52100054321"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="possessionDate">Possession Date</Label>
                    <Input
                      id="possessionDate"
                      type="date"
                      value={formData.possessionDate}
                      onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="totalUnits">Total Units</Label>
                    <Input
                      id="totalUnits"
                      type="number"
                      value={formData.totalUnits}
                      onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value })}
                      placeholder="e.g., 500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="towers">Number of Towers</Label>
                    <Input
                      id="towers"
                      type="number"
                      value={formData.towers}
                      onChange={(e) => setFormData({ ...formData, towers: e.target.value })}
                      placeholder="e.g., 5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="floors">Floors per Tower</Label>
                    <Input
                      id="floors"
                      type="number"
                      value={formData.floors}
                      onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                      placeholder="e.g., 25"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Builder Tab */}
              <TabsContent value="builder" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="builderDescription">Builder Description / History</Label>
                    <Textarea
                      id="builderDescription"
                      value={formData.builderDescription}
                      onChange={(e) => setFormData({ ...formData, builderDescription: e.target.value })}
                      placeholder="About the builder, their history, achievements, etc."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="builderLogo">Builder Logo</Label>
                    <ImageUpload
                      value={formData.builderLogo}
                      onChange={(url: string | null) => setFormData({ ...formData, builderLogo: url || "" })}
                      placeholder="Upload builder logo or enter URL"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="builderEstablished">Year Established</Label>
                    <Input
                      id="builderEstablished"
                      type="number"
                      value={formData.builderEstablished}
                      onChange={(e) => setFormData({ ...formData, builderEstablished: e.target.value })}
                      placeholder="e.g., 1995"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="builderProjects">Total Projects by Builder</Label>
                    <Input
                      id="builderProjects"
                      type="number"
                      value={formData.builderProjects}
                      onChange={(e) => setFormData({ ...formData, builderProjects: e.target.value })}
                      placeholder="e.g., 50"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUpload
                    label="Cover Image"
                    value={formData.coverImage}
                    onChange={(url) => setFormData({ ...formData, coverImage: url })}
                    placeholder="Enter cover image URL or upload"
                    helpText="Main image displayed on project cards"
                  />

                  <ImageUpload
                    label="Master Plan Image"
                    value={formData.masterPlanUrl}
                    onChange={(url) => setFormData({ ...formData, masterPlanUrl: url })}
                    placeholder="Enter master plan URL or upload"
                    helpText="Site layout/master plan image"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Main Video URL (YouTube)</Label>
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <p className="text-sm text-muted-foreground">YouTube URL for main project video</p>
                  </div>

                  <ImageUpload
                    label="Brochure (PDF or Image)"
                    value={formData.brochureUrl}
                    onChange={(url) => setFormData({ ...formData, brochureUrl: url })}
                    placeholder="Enter brochure URL or upload"
                    helpText="Upload PDF or image brochure"
                    accept="image/*,application/pdf"
                  />
                </div>

                {/* Gallery Images */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2 text-lg font-semibold">
                    <ImageIcon className="h-4 w-4" />
                    Gallery Images
                  </Label>
                  <GalleryImageUpload
                    images={images}
                    onChange={setImages}
                    showCoverSelection={true}
                  />
                </div>

                {/* Videos - YouTube URLs only */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-lg font-semibold">
                      <Video className="h-4 w-4" />
                      Additional Video URLs
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setVideos([...videos, { videoUrl: "", videoType: "youtube", title: "" }])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add YouTube URL
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Add YouTube video URLs for project tours, walkthroughs, etc.</p>
                  {videos.map((video, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 border rounded-lg bg-secondary/30">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={video.videoUrl}
                          onChange={(e) => {
                            const newVideos = [...videos];
                            newVideos[index].videoUrl = e.target.value;
                            setVideos(newVideos);
                          }}
                          placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
                        />
                        <div className="flex gap-2">
                          <Input
                            value={video.title}
                            onChange={(e) => {
                              const newVideos = [...videos];
                              newVideos[index].title = e.target.value;
                              setVideos(newVideos);
                            }}
                            placeholder="Video title (e.g., Project Walkthrough)"
                            className="flex-1"
                          />
                          <Select
                            value={video.videoType}
                            onValueChange={(value) => {
                              const newVideos = [...videos];
                              newVideos[index].videoType = value;
                              setVideos(newVideos);
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
                        onClick={() => setVideos(videos.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {videos.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <Video className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">No additional videos added</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Amenities & Floor Plans Tab */}
              <TabsContent value="amenities" className="space-y-6">
                {/* Amenities */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold">Amenities</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAmenities([...amenities, { name: "", icon: "", imageUrl: "" }])}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Amenity
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Add amenities with optional images for beautiful display on project page</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map((amenity, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-3">
                          <div className="flex gap-2 items-center">
                            <Select
                              value={amenity.icon}
                              onValueChange={(value) => {
                                const newAmenities = [...amenities];
                                newAmenities[index].icon = value;
                                if (!newAmenities[index].name) {
                                  const iconInfo = AMENITY_ICONS.find(i => i.value === value);
                                  if (iconInfo) newAmenities[index].name = iconInfo.label;
                                }
                                setAmenities(newAmenities);
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
                                const newAmenities = [...amenities];
                                newAmenities[index].name = e.target.value;
                                setAmenities(newAmenities);
                              }}
                              placeholder="Amenity name"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => setAmenities(amenities.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                          <ImageUpload
                            value={amenity.imageUrl}
                            onChange={(url) => {
                              const newAmenities = [...amenities];
                              newAmenities[index].imageUrl = url;
                              setAmenities(newAmenities);
                            }}
                            placeholder="Amenity image URL (optional)"
                            helpText="Add an image for this amenity"
                          />
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
                    <Label className="text-lg font-semibold flex items-center gap-2">
                      <Layers className="h-5 w-5" />
                      Floor Plans
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFloorPlans([...floorPlans, { 
                        name: "", 
                        bedrooms: 2, 
                        bathrooms: 2, 
                        area: 0, 
                        price: 0, 
                        imageUrl: "" 
                      }])}
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
                              const newPlans = [...floorPlans];
                              newPlans[index].name = e.target.value;
                              setFloorPlans(newPlans);
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
                              const newPlans = [...floorPlans];
                              newPlans[index].bedrooms = parseInt(e.target.value) || 0;
                              setFloorPlans(newPlans);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Bathrooms</Label>
                          <Input
                            type="number"
                            value={plan.bathrooms}
                            onChange={(e) => {
                              const newPlans = [...floorPlans];
                              newPlans[index].bathrooms = parseInt(e.target.value) || 0;
                              setFloorPlans(newPlans);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Area (sq.ft)</Label>
                          <Input
                            type="number"
                            value={plan.area}
                            onChange={(e) => {
                              const newPlans = [...floorPlans];
                              newPlans[index].area = parseInt(e.target.value) || 0;
                              setFloorPlans(newPlans);
                            }}
                          />
                        </div>
                        <div>
                          <Label>Price (₹)</Label>
                          <Input
                            type="number"
                            value={plan.price}
                            onChange={(e) => {
                              const newPlans = [...floorPlans];
                              newPlans[index].price = parseInt(e.target.value) || 0;
                              setFloorPlans(newPlans);
                            }}
                          />
                        </div>
                        <div className="col-span-2 md:col-span-5">
                          <Label>Floor Plan Image</Label>
                          <ImageUpload
                            value={plan.imageUrl}
                            onChange={(url: string | null) => {
                              const newPlans = [...floorPlans];
                              newPlans[index].imageUrl = url || "";
                              setFloorPlans(newPlans);
                            }}
                            placeholder="Upload floor plan image or enter URL"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => setFloorPlans(floorPlans.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => setLocation("/admin/dashboard")}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createProject.isPending || updateProject.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {createProject.isPending || updateProject.isPending ? "Saving..." : (isEdit ? "Update Project" : "Create Project")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
