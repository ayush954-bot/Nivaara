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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import { getAllLocationsWithAreas, detectZone } from "@/lib/locations";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import { PropertyImageUpload } from "@/components/PropertyImageUpload";
import { PropertyVideoUpload } from "@/components/PropertyVideoUpload";
import { ImageUpload } from "@/components/ImageUpload";

export default function PropertyForm() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const propertyId = params.id ? parseInt(params.id) : null;
  const isEdit = !!propertyId;

  const { user, canManageProperties, isLoading: authLoading } = useAuth();
  const { data: property } = trpc.properties.getById.useQuery(
    { id: propertyId! },
    { enabled: isEdit && !!propertyId }
  );

  // Fetch existing images for edit mode
  const { data: existingImages = [], isLoading: imagesLoading } = trpc.admin.properties.images.list.useQuery(
    { propertyId: propertyId! },
    { enabled: isEdit && !!propertyId }
  );

  // Fetch existing videos for edit mode
  const { data: existingVideos = [] } = trpc.admin.properties.videos.list.useQuery(
    { propertyId: propertyId! },
    { enabled: isEdit && !!propertyId }
  );

  console.log('[PropertyForm] Edit mode:', isEdit, 'PropertyId:', propertyId);
  console.log('[PropertyForm] existingImages:', existingImages, 'Loading:', imagesLoading);
  console.log('[PropertyForm] existingVideos:', existingVideos);

  const createProperty = trpc.admin.properties.create.useMutation({
    onSuccess: () => {
      setLocation("/admin/dashboard");
    },
  });

  const updateProperty = trpc.admin.properties.update.useMutation({
    onSuccess: () => {
      setLocation("/admin/dashboard");
    },
  });

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    propertyType: "Flat" as "Flat" | "Shop" | "Office" | "Land" | "Rental" | "Bank Auction",
    status: "Ready" as "Under-Construction" | "Ready",
    location: "",
    latitude: null as number | null,
    longitude: null as number | null,
    zone: null as "east_pune" | "west_pune" | "north_pune" | "south_pune" | "other" | null,
    area: "",
    price: "",
    priceLabel: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    builder: "",
    imageUrl: "",
    videoUrl: "",
    badge: "",
    customBadgeText: "",
    featured: false,
    brochureUrl: "",
    images: [] as Array<{ id?: number; imageUrl: string; isCover: boolean; displayOrder: number }>,
    videos: [] as Array<{ id?: number; videoUrl: string; videoType: "youtube" | "vimeo" | "virtual_tour" | "other"; displayOrder: number }>,
  });



  useEffect(() => {
    console.log('[PropertyForm useEffect] property:', property, 'existingImages:', existingImages);
    if (property) {
      const allLocations = getAllLocationsWithAreas();
      const isCustomLocation = !allLocations.includes(property.location);
      
      setFormData({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        status: property.status,
        location: property.location,
        latitude: property.latitude ? parseFloat(property.latitude.toString()) : null,
        longitude: property.longitude ? parseFloat(property.longitude.toString()) : null,
        zone: property.zone || detectZone(property.location),
        area: property.area || "",
        price: property.price.toString(),
        priceLabel: property.priceLabel || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area_sqft: property.area_sqft?.toString() || "",
        builder: property.builder || "",
        imageUrl: property.imageUrl || "",
        videoUrl: property.videoUrl || "",
        badge: property.badge || "",
        customBadgeText: property.customBadgeText || "",
        featured: property.featured,
        brochureUrl: property.brochureUrl || "",
        images: existingImages.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isCover: img.isCover,
          displayOrder: img.displayOrder
        })),
        videos: existingVideos.map(video => ({
          id: video.id,
          videoUrl: video.videoUrl,
          videoType: video.videoType,
          displayOrder: video.displayOrder
        })),
      });
      

    }
  }, [property, existingImages, existingVideos]);

  // Auto-clear bedrooms/bathrooms when switching to non-residential property types
  useEffect(() => {
    if (formData.propertyType !== "Flat" && formData.propertyType !== "Rental") {
      if (formData.bedrooms || formData.bathrooms) {
        setFormData(prev => ({
          ...prev,
          bedrooms: "",
          bathrooms: "",
        }));
      }
    }
  }, [formData.propertyType]);

  const addImageMutation = trpc.admin.properties.images.add.useMutation();
  const deleteAllImagesMutation = trpc.admin.properties.images.deleteAll.useMutation();
  const addVideoMutation = trpc.admin.properties.videos.add.useMutation();
  const deleteAllVideosMutation = trpc.admin.properties.videos.deleteAll.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that location has coordinates (user must select from dropdown)
    if (!formData.latitude || !formData.longitude) {
      alert("Please select a location from the dropdown suggestions. Type to search and click on a suggestion.");
      return;
    }

    // Get cover image URL for backward compatibility with imageUrl field
    const coverImage = formData.images.find(img => img.isCover);
    const imageUrl = coverImage?.imageUrl || formData.images[0]?.imageUrl || "";

    const data = {
      ...formData,
      imageUrl, // Set imageUrl to cover image for backward compatibility
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : undefined,
    };

    if (isEdit && propertyId) {
      await updateProperty.mutateAsync({ id: propertyId, ...data });
      
      // Handle image updates for edit mode
      // First, delete ALL existing images
      await deleteAllImagesMutation.mutateAsync({ propertyId });
      
      // Then add the current images from formData (which reflects user's changes)
      if (formData.images.length > 0) {
        for (const image of formData.images) {
          await addImageMutation.mutateAsync({
            propertyId: propertyId,
            imageUrl: image.imageUrl,
            isCover: image.isCover,
            displayOrder: image.displayOrder,
          });
        }
      }

      // Handle video updates for edit mode
      await deleteAllVideosMutation.mutateAsync({ propertyId });
      if (formData.videos.length > 0) {
        for (const video of formData.videos) {
          await addVideoMutation.mutateAsync({
            propertyId: propertyId,
            videoUrl: video.videoUrl,
            videoType: video.videoType,
            displayOrder: video.displayOrder,
          });
        }
      }
    } else {
      // Create property first
      const result = await createProperty.mutateAsync(data as any);
      
      // Then add images to property_images table
      if (result && result.id && formData.images.length > 0) {
        for (const image of formData.images) {
          await addImageMutation.mutateAsync({
            propertyId: result.id,
            imageUrl: image.imageUrl,
            isCover: image.isCover,
            displayOrder: image.displayOrder,
          });
        }
      }

      // Then add videos to property_videos table
      if (result && result.id && formData.videos.length > 0) {
        for (const video of formData.videos) {
          await addVideoMutation.mutateAsync({
            propertyId: result.id,
            videoUrl: video.videoUrl,
            videoType: video.videoType,
            displayOrder: video.displayOrder,
          });
        }
      }
    }
  };

  if (authLoading) {
    return <div className="container py-16 text-center">Loading...</div>;
  }

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
              Admin access is required to manage properties.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/admin/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? "Edit Property" : "Add New Property"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>

              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Luxury 3 BHK Apartment"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed property description..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyType">Property Type *</Label>
                  <Select
                    value={formData.propertyType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, propertyType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ready">Ready to Move</SelectItem>
                      <SelectItem value="Under-Construction">
                        Under Construction
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Location Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location Details</h3>

              <div>
                <Label htmlFor="location">City/Location *</Label>
                <LocationAutocomplete
                  value={formData.location}
                  onChange={(location, lat, lon) => {
                    const detectedZone = detectZone(location);
                    setFormData({
                      ...formData,
                      location,
                      latitude: lat || null,
                      longitude: lon || null,
                      zone: detectedZone,
                    });
                  }}
                  placeholder="Type to search location (e.g., Kharadi, Pune)"
                />
                {formData.latitude && formData.longitude ? (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location coordinates captured (Lat: {formData.latitude.toFixed(4)}, Lon: {formData.longitude.toFixed(4)})
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Please select a location from the dropdown suggestions (coordinates required)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="area">Additional Area Details (Optional)</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  placeholder="e.g., Near Airport, Sector 5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add extra location details if needed
                </p>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Pricing</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="e.g., 11500000"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter amount in rupees (e.g., 11500000 for ₹1.15 Cr)
                  </p>
                </div>

                <div>
                  <Label htmlFor="priceLabel">Price Label</Label>
                  <Input
                    id="priceLabel"
                    value={formData.priceLabel}
                    onChange={(e) =>
                      setFormData({ ...formData, priceLabel: e.target.value })
                    }
                    placeholder="e.g., ₹1.15 Crores"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Property Details</h3>

              <div className="grid grid-cols-3 gap-4">
                {/* Only show bedrooms/bathrooms for Flat and Rental types */}
                {(formData.propertyType === "Flat" || formData.propertyType === "Rental") && (
                  <>
                    <div>
                      <Label htmlFor="bedrooms">Bedrooms *</Label>
                      <Input
                        id="bedrooms"
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bedrooms: e.target.value })
                        }
                        placeholder="e.g., 3"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Required for Flat/Rental properties
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bathrooms">Bathrooms</Label>
                      <Input
                        id="bathrooms"
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) =>
                          setFormData({ ...formData, bathrooms: e.target.value })
                        }
                        placeholder="e.g., 2"
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="area_sqft">Area (sq ft)</Label>
                  <Input
                    id="area_sqft"
                    type="number"
                    value={formData.area_sqft}
                    onChange={(e) =>
                      setFormData({ ...formData, area_sqft: e.target.value })
                    }
                    placeholder="e.g., 1450"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="builder">Builder/Developer</Label>
                <Input
                  id="builder"
                  value={formData.builder}
                  onChange={(e) =>
                    setFormData({ ...formData, builder: e.target.value })
                  }
                  placeholder="e.g., Lodha Group, Godrej Properties"
                />
              </div>
            </div>

            {/* Media */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Media</h3>

              <PropertyImageUpload
                propertyId={propertyId || undefined}
                images={formData.images}
                onChange={(newImages) => {
                  console.log('[PropertyForm] onChange called with newImages.length:', newImages.length);
                  // Simply replace the images array (component handles appending for uploads)
                  setFormData(prev => {
                    console.log('[PropertyForm] prev.images.length:', prev.images.length);
                    console.log('[PropertyForm] Setting images to newImages.length:', newImages.length);
                    return {
                      ...prev,
                      images: newImages
                    };
                  });
                }}
              />

              <PropertyVideoUpload
                videos={formData.videos}
                onChange={(newVideos) => {
                  setFormData(prev => ({
                    ...prev,
                    videos: newVideos
                  }));
                }}
              />

              <div>
                <Label htmlFor="brochureUrl">Brochure PDF (Optional)</Label>
                <ImageUpload
                  value={formData.brochureUrl}
                  onChange={(url: string | null) => setFormData({ ...formData, brochureUrl: url || "" })}
                  accept="application/pdf"
                  placeholder="Upload brochure PDF or enter URL"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a PDF brochure for this property
                </p>
              </div>

              <div>
                <Label htmlFor="badge">Property Badge (Optional)</Label>
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
                    <SelectItem value="Price Reduced">Price Reduced</SelectItem>
                    <SelectItem value="Exclusive">Exclusive</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a predefined badge. "New" badge is automatically shown for properties added in the last 30 days.
                </p>
              </div>

              <div>
                <Label htmlFor="customBadgeText">Custom Badge Text (Optional)</Label>
                <Input
                  id="customBadgeText"
                  value={formData.customBadgeText}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 25); // Limit to 25 characters
                    setFormData({ ...formData, customBadgeText: value });
                  }}
                  placeholder="e.g., Bank Auction, Owner Motivated"
                  maxLength={25}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add custom badge text (max 25 characters). This will display along with the predefined badge and automatic "New" badge if applicable.
                </p>
              </div>
            </div>

            {/* Featured */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, featured: checked as boolean })
                }
              />
              <Label htmlFor="featured" className="cursor-pointer">
                Mark as Featured Property (will appear on homepage)
              </Label>
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button type="submit" disabled={createProperty.isPending || updateProperty.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? "Update Property" : "Create Property"}
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
        </CardContent>
      </Card>
    </div>
  );
}
