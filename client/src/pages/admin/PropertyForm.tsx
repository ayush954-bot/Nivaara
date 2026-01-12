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
    propertyType: "Flat" as "Flat" | "Shop" | "Office" | "Land" | "Rental",
    status: "Ready" as "Under-Construction" | "Ready",
    location: "",
    area: "",
    price: "",
    priceLabel: "",
    bedrooms: "",
    bathrooms: "",
    area_sqft: "",
    builder: "",
    imageUrl: "",
    featured: false,
  });

  useEffect(() => {
    if (property) {
      setFormData({
        title: property.title,
        description: property.description,
        propertyType: property.propertyType,
        status: property.status,
        location: property.location,
        area: property.area || "",
        price: property.price.toString(),
        priceLabel: property.priceLabel || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area_sqft: property.area_sqft?.toString() || "",
        builder: property.builder || "",
        imageUrl: property.imageUrl || "",
        featured: property.featured,
      });
    }
  }, [property]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...formData,
      bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : undefined,
      bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : undefined,
      area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : undefined,
    };

    if (isEdit && propertyId) {
      await updateProperty.mutateAsync({ id: propertyId, ...data });
    } else {
      await createProperty.mutateAsync(data as any);
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
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Pune, Mumbai, Dubai"
                  required
                />
              </div>

              <div>
                <Label htmlFor="area">Specific Area</Label>
                <Input
                  id="area"
                  value={formData.area}
                  onChange={(e) =>
                    setFormData({ ...formData, area: e.target.value })
                  }
                  placeholder="e.g., Kharadi, Viman Nagar"
                />
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

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload your image to a hosting service and paste the URL here
                </p>
              </div>

              {formData.imageUrl && (
                <div>
                  <Label>Preview</Label>
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full max-w-md h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
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
