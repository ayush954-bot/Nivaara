import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";
import PropertyImageUpload from "@/components/PropertyImageUpload";
import PropertyVideoUpload from "@/components/PropertyVideoUpload";

export default function ProjectForm() {
  const [, params] = useRoute("/admin/projects/:id/edit");
  const [, setLocation] = useLocation();
  const projectId = params?.id ? parseInt(params.id) : null;
  const isEditMode = projectId !== null;

  const [formData, setFormData] = useState({
    name: "",
    builderId: undefined as number | undefined,
    builderName: "",
    location: "",
    city: "Pune",
    state: "Maharashtra",
    description: "",
    highlights: "",
    priceRange: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    status: "Upcoming" as "Upcoming" | "Under Construction" | "Ready to Move" | "Completed",
    reraNumber: "",
    launchDate: "",
    possessionDate: "",
    totalUnits: undefined as number | undefined,
    availableUnits: undefined as number | undefined,
    landArea: "",
    towers: undefined as number | undefined,
    floors: undefined as number | undefined,
    configurations: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    featured: false,
    badge: "",
    customBadgeText: "",
    images: [] as Array<{ imageUrl: string; imageKey?: string; isCover: boolean; displayOrder: number }>,
    videos: [] as Array<{ videoUrl: string; videoType: string; displayOrder: number }>,
  });

  // Fetch project data if editing
  const { data: project, isLoading: projectLoading } = trpc.projects.getById.useQuery(
    { id: projectId! },
    { enabled: isEditMode }
  );

  // Fetch project images
  const { data: projectImages = [] } = trpc.projects.images.list.useQuery(
    { projectId: projectId! },
    { enabled: isEditMode }
  );

  // Fetch project videos
  const { data: projectVideos = [] } = trpc.projects.videos.list.useQuery(
    { projectId: projectId! },
    { enabled: isEditMode }
  );

  // Fetch builders for dropdown
  const { data: builders = [] } = trpc.builders.list.useQuery();

  // Load project data into form
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        builderId: project.builderId || undefined,
        builderName: project.builderName || "",
        location: project.location || "",
        city: project.city || "Pune",
        state: project.state || "Maharashtra",
        description: project.description || "",
        highlights: project.highlights || "",
        priceRange: project.priceRange || "",
        minPrice: project.minPrice || undefined,
        maxPrice: project.maxPrice || undefined,
        status: project.status || "Upcoming",
        reraNumber: project.reraNumber || "",
        launchDate: project.launchDate || "",
        possessionDate: project.possessionDate || "",
        totalUnits: project.totalUnits || undefined,
        availableUnits: project.availableUnits || undefined,
        landArea: project.landArea || "",
        towers: project.towers || undefined,
        floors: project.floors || undefined,
        configurations: project.configurations || "",
        latitude: project.latitude || undefined,
        longitude: project.longitude || undefined,
        featured: project.featured || false,
        badge: project.badge || "",
        customBadgeText: project.customBadgeText || "",
        images: projectImages.map((img: any) => ({
          imageUrl: img.imageUrl,
          imageKey: img.imageKey,
          isCover: img.isCover,
          displayOrder: img.displayOrder,
        })),
        videos: projectVideos.map((vid: any) => ({
          videoUrl: vid.videoUrl,
          videoType: vid.videoType,
          displayOrder: vid.displayOrder,
        })),
      });
    }
  }, [project, projectImages, projectVideos]);

  // Mutations
  const createMutation = trpc.projects.create.useMutation();
  const updateMutation = trpc.projects.update.useMutation();
  const addImageMutation = trpc.projects.images.add.useMutation();
  const deleteAllImagesMutation = trpc.projects.images.deleteAll.useMutation();
  const addVideoMutation = trpc.projects.videos.add.useMutation();
  const deleteAllVideosMutation = trpc.projects.videos.deleteAll.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditMode) {
        // Update project
        await updateMutation.mutateAsync({
          id: projectId,
          ...formData,
        });

        // Delete all existing images and videos
        await deleteAllImagesMutation.mutateAsync({ projectId });
        await deleteAllVideosMutation.mutateAsync({ projectId });

        // Add images
        if (formData.images.length > 0) {
          for (const image of formData.images) {
            await addImageMutation.mutateAsync({
              projectId,
              ...image,
            });
          }
        }

        // Add videos
        if (formData.videos.length > 0) {
          for (const video of formData.videos) {
            await addVideoMutation.mutateAsync({
              projectId,
              ...video,
            });
          }
        }

        toast.success("Project updated successfully!");
      } else {
        // Create project
        const result = await createMutation.mutateAsync(formData);
        const newProjectId = result.id;

        // Add images
        if (formData.images.length > 0) {
          for (const image of formData.images) {
            await addImageMutation.mutateAsync({
              projectId: newProjectId,
              ...image,
            });
          }
        }

        // Add videos
        if (formData.videos.length > 0) {
          for (const video of formData.videos) {
            await addVideoMutation.mutateAsync({
              projectId: newProjectId,
              ...video,
            });
          }
        }

        toast.success("Project created successfully!");
      }

      setLocation("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to save project");
    }
  };

  if (isEditMode && projectLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Button
        variant="ghost"
        onClick={() => setLocation("/admin/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-6">
        {isEditMode ? "Edit Project" : "Add New Project"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="builderId">Builder (Optional)</Label>
              <Select
                value={formData.builderId?.toString() || ""}
                onValueChange={(value) => {
                  const builder = builders.find((b: any) => b.id === parseInt(value));
                  setFormData({
                    ...formData,
                    builderId: value ? parseInt(value) : undefined,
                    builderName: builder?.name || formData.builderName,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select builder" />
                </SelectTrigger>
                <SelectContent>
                  {builders.map((builder: any) => (
                    <SelectItem key={builder.id} value={builder.id.toString()}>
                      {builder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="builderName">Builder Name *</Label>
              <Input
                id="builderName"
                value={formData.builderName}
                onChange={(e) => setFormData({ ...formData, builderName: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Kharadi, Pune"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="highlights">Highlights (Optional)</Label>
            <Textarea
              id="highlights"
              value={formData.highlights}
              onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
              placeholder="Key features, one per line"
              rows={3}
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pricing</h2>

          <div>
            <Label htmlFor="priceRange">Price Range *</Label>
            <Input
              id="priceRange"
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              placeholder="e.g., ₹75 Lakhs - ₹1.2 Cr"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPrice">Min Price (₹)</Label>
              <Input
                id="minPrice"
                type="number"
                value={formData.minPrice || ""}
                onChange={(e) => setFormData({ ...formData, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="maxPrice">Max Price (₹)</Label>
              <Input
                id="maxPrice"
                type="number"
                value={formData.maxPrice || ""}
                onChange={(e) => setFormData({ ...formData, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Details</h2>

          <div>
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Upcoming">Upcoming</SelectItem>
                <SelectItem value="Under Construction">Under Construction</SelectItem>
                <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="reraNumber">RERA Number</Label>
            <Input
              id="reraNumber"
              value={formData.reraNumber}
              onChange={(e) => setFormData({ ...formData, reraNumber: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="launchDate">Launch Date</Label>
              <Input
                id="launchDate"
                type="date"
                value={formData.launchDate}
                onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="possessionDate">Possession Date</Label>
              <Input
                id="possessionDate"
                type="date"
                value={formData.possessionDate}
                onChange={(e) => setFormData({ ...formData, possessionDate: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="totalUnits">Total Units</Label>
              <Input
                id="totalUnits"
                type="number"
                value={formData.totalUnits || ""}
                onChange={(e) => setFormData({ ...formData, totalUnits: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="availableUnits">Available Units</Label>
              <Input
                id="availableUnits"
                type="number"
                value={formData.availableUnits || ""}
                onChange={(e) => setFormData({ ...formData, availableUnits: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="landArea">Land Area</Label>
            <Input
              id="landArea"
              value={formData.landArea}
              onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
              placeholder="e.g., 5 Acres"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="towers">Number of Towers</Label>
              <Input
                id="towers"
                type="number"
                value={formData.towers || ""}
                onChange={(e) => setFormData({ ...formData, towers: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="floors">Floors per Tower</Label>
              <Input
                id="floors"
                type="number"
                value={formData.floors || ""}
                onChange={(e) => setFormData({ ...formData, floors: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="configurations">Configurations</Label>
            <Input
              id="configurations"
              value={formData.configurations}
              onChange={(e) => setFormData({ ...formData, configurations: e.target.value })}
              placeholder="e.g., 2 BHK, 3 BHK, 4 BHK"
            />
          </div>
        </div>

        {/* Location Coordinates */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Location Coordinates (Optional)</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude || ""}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>

            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude || ""}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Images</h2>
          <PropertyImageUpload
            images={formData.images}
            onImagesChange={(images) => setFormData({ ...formData, images })}
          />
        </div>

        {/* Videos */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Project Videos</h2>
          <PropertyVideoUpload
            videos={formData.videos}
            onVideosChange={(videos) => setFormData({ ...formData, videos })}
          />
        </div>

        {/* Badges & Featured */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Marketing</h2>

          <div>
            <Label htmlFor="badge">Badge</Label>
            <Select
              value={formData.badge || "none"}
              onValueChange={(value) => setFormData({ ...formData, badge: value === "none" ? "" : value })}
            >
              <SelectTrigger>
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
            <Label htmlFor="customBadgeText">Custom Badge Text (Optional)</Label>
            <Input
              id="customBadgeText"
              value={formData.customBadgeText}
              onChange={(e) => setFormData({ ...formData, customBadgeText: e.target.value })}
              maxLength={25}
              placeholder="e.g., Bank Auction, Owner Motivated"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {formData.customBadgeText.length}/25 characters
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Feature this project on homepage
            </Label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            {(createMutation.isPending || updateMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isEditMode ? "Update Project" : "Create Project"}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation("/admin/dashboard")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
