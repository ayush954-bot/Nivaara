import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Upload, X, Loader2, Plus, Star, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  imageUrl: string;
  caption: string;
  isCover?: boolean;
}

interface GalleryImageUploadProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  showCoverSelection?: boolean;
}

export function GalleryImageUpload({
  images,
  onChange,
  showCoverSelection = false,
}: GalleryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");

  const uploadImage = trpc.imageUpload.uploadImage.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const newImages: GalleryImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is too large (max 10MB)`);
          continue;
        }

        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;

        const result = await uploadImage.mutateAsync({
          imageData: base64Data,
          fileName: file.name,
          mimeType: file.type,
        });

        newImages.push({
          imageUrl: result.url,
          caption: file.name.replace(/\.[^/.]+$/, ""),
          isCover: false,
        });

        toast.success(`${file.name} uploaded`);
      }

      if (newImages.length > 0) {
        const allImages = [...images, ...newImages];
        if (showCoverSelection && allImages.length > 0 && !allImages.some(img => img.isCover)) {
          allImages[0].isCover = true;
        }
        onChange(allImages);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!newUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }

    const newImage: GalleryImage = {
      imageUrl: newUrl.trim(),
      caption: newCaption.trim(),
      isCover: showCoverSelection && images.length === 0,
    };

    onChange([...images, newImage]);
    setNewUrl("");
    setNewCaption("");
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    if (showCoverSelection && images[index].isCover && newImages.length > 0) {
      newImages[0].isCover = true;
    }
    onChange(newImages);
  };

  const handleSetCover = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    onChange(newImages);
  };

  const handleCaptionChange = (index: number, caption: string) => {
    const newImages = [...images];
    newImages[index].caption = caption;
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            disabled={uploading}
            className="cursor-pointer w-auto"
            id="gallery-upload"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
        >
          <LinkIcon className="h-4 w-4 mr-1" />
          Add URL
        </Button>
      </div>

      {showUrlInput && (
        <div className="flex gap-2 items-end p-4 border rounded-lg bg-secondary/30">
          <div className="flex-1 space-y-1">
            <Label>Image URL</Label>
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="w-40 space-y-1">
            <Label>Caption</Label>
            <Input
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder="Caption"
            />
          </div>
          <Button type="button" onClick={handleAddUrl} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowUrlInput(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading images...
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card key={index} className="relative overflow-hidden">
              <img
                src={image.imageUrl}
                alt={image.caption || `Image ${index + 1}`}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text fill="%23999" x="50%" y="50%" text-anchor="middle" dy=".3em">Error</text></svg>';
                }}
              />
              {/* Action buttons always visible to prevent accidental touch issues */}
              <div className="absolute top-2 right-2 flex gap-1">
                {showCoverSelection && (
                  <Button
                    type="button"
                    size="sm"
                    variant={image.isCover ? "default" : "secondary"}
                    onClick={() => handleSetCover(index)}
                    title="Set as cover image"
                  >
                    <Star className={`h-4 w-4 ${image.isCover ? "fill-current" : ""}`} />
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.confirm('Remove this image?')) {
                      handleRemove(index);
                    }
                  }}
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {showCoverSelection && image.isCover && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                  Cover
                </div>
              )}
              <div className="p-2">
                <Input
                  value={image.caption}
                  onChange={(e) => handleCaptionChange(index, e.target.value)}
                  placeholder="Caption"
                  className="text-xs h-7"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
          <Upload className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground">
            Upload images or add URLs to build your gallery
          </p>
        </div>
      )}
    </div>
  );
}
