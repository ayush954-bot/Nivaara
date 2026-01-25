import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helpText?: string;
  accept?: string; // e.g., "image/*" or "image/*,application/pdf"
}

export function ImageUpload({
  label,
  value,
  onChange,
  placeholder = "Enter image URL or upload",
  helpText,
  accept = "image/*",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(!value || value.startsWith("http"));

  const uploadImage = trpc.imageUpload.uploadImage.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    
    if (!isImage && !isPdf) {
      toast.error("Please select an image or PDF file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large (max 10MB)");
      return;
    }

    setUploading(true);

    try {
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

      onChange(result.url);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          {showUrlInput ? (
            <Input
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={uploading}
            />
          ) : (
            <Input
              type="file"
              accept={accept}
              onChange={handleFileChange}
              disabled={uploading}
              className="cursor-pointer"
            />
          )}
        </div>
        
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowUrlInput(!showUrlInput)}
          title={showUrlInput ? "Switch to upload" : "Switch to URL input"}
        >
          {showUrlInput ? <Upload className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
        
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClear}
            title="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Uploading...
        </div>
      )}

      {helpText && (
        <p className="text-sm text-muted-foreground">{helpText}</p>
      )}

      {/* Preview */}
      {value && value.startsWith("http") && (
        <div className="mt-2">
          {value.toLowerCase().endsWith(".pdf") || 
           value.includes("application/pdf") || 
           value.includes("/pdf/") ||
           value.toLowerCase().includes("brochure") ? (
            <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded border">
              <svg className="h-6 w-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 12h1v1h-1v-1zm0 2h1v3h-1v-3zm2.5-2h1.5c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H12v2h-1v-5zm1 2h.5v-1H12v1zm3-2h1.5c.55 0 1 .45 1 1v3c0 .55-.45 1-1 1H15v-5zm1 4h.5v-3H16v3z"/>
              </svg>
              <a 
                href={value} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline font-medium"
              >
                View/Download PDF
              </a>
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              className="h-20 w-20 object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
