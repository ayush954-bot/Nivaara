import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PropertyImage {
  id?: number;
  imageUrl: string;
  isCover: boolean;
  displayOrder: number;
}

interface PropertyImageUploadProps {
  propertyId?: number; // undefined for new properties
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

export function PropertyImageUpload({
  propertyId,
  images,
  onChange,
}: PropertyImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const uploadImage = trpc.imageUpload.uploadImage.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      // Accumulate new images in local array to avoid overwriting
      const newImages: PropertyImage[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 5MB)`);
          continue;
        }

        // Convert to base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;

        // Upload to S3
        const result = await uploadImage.mutateAsync({
          imageData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        });

        // Add to local array
        // Note: isCover will be set to false for all new images
        // Parent component will handle setting the first image as cover
        const newImage: PropertyImage = {
          imageUrl: result.url,
          isCover: false,
          displayOrder: images.length + newImages.length,
        };

        newImages.push(newImage);
        toast.success(`${file.name} uploaded successfully`);
      }
      
      // Update parent component with full array (existing + new)
      if (newImages.length > 0) {
        const allImages = [...images, ...newImages];
        // Set first image as cover if no cover exists
        if (allImages.length > 0 && !allImages.some(img => img.isCover)) {
          allImages[0].isCover = true;
        }
        onChange(allImages);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    console.log('[PropertyImageUpload] handleRemoveImage called');
    console.log('[PropertyImageUpload] index:', index);
    console.log('[PropertyImageUpload] Current images.length:', images.length);
    const newImages = images.filter((_, i) => i !== index);
    // If removed image was cover, make first image cover
    if (images[index].isCover && newImages.length > 0) {
      newImages[0].isCover = true;
    }
    // Update display order
    newImages.forEach((img, i) => {
      img.displayOrder = i;
    });
    console.log('[PropertyImageUpload] Calling onChange with newImages.length:', newImages.length);
    onChange(newImages);
  };

  const handleSetCover = (index: number) => {
    console.log('[PropertyImageUpload] handleSetCover called');
    console.log('[PropertyImageUpload] index:', index);
    console.log('[PropertyImageUpload] Current images.length:', images.length);
    const newImages = images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    console.log('[PropertyImageUpload] Calling onChange with newImages.length:', newImages.length);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">Property Images</Label>
        <div className="mt-2">
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload multiple images (max 5MB each). First image or starred image will be the cover.
          </p>
        </div>
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading images...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative group overflow-hidden">
              <img
                src={image.imageUrl}
                alt={`Property image ${index + 1}`}
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={image.isCover ? "default" : "secondary"}
                  onClick={() => handleSetCover(index)}
                  title="Set as cover image"
                >
                  <Star className={`h-4 w-4 ${image.isCover ? "fill-current" : ""}`} />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage(index)}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {image.isCover && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Cover
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <p className="text-sm text-muted-foreground">
            No images uploaded yet. Click "Choose Files" above to upload property images.
          </p>
        </div>
      )}
    </div>
  );
}
