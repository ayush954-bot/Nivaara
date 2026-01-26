import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, MessageCircle, Loader2, Download, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareWithImageProps {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareWithImage({
  title,
  text,
  url,
  imageUrl,
  variant = "outline",
  size = "default",
  className,
}: ShareWithImageProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if Web Share API with files is supported
  const canShareFiles = typeof navigator !== "undefined" && 
    navigator.canShare && 
    navigator.canShare({ files: [new File([""], "test.png", { type: "image/png" })] });

  // Convert image URL to File object
  const fetchImageAsFile = async (imgUrl: string): Promise<File | null> => {
    try {
      // Handle relative URLs
      const absoluteUrl = imgUrl.startsWith("http") 
        ? imgUrl 
        : `${window.location.origin}${imgUrl}`;
      
      const response = await fetch(absoluteUrl);
      const blob = await response.blob();
      const fileName = imgUrl.split("/").pop() || "image.jpg";
      return new File([blob], fileName, { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  // Share with image using Web Share API
  const handleShareWithImage = async () => {
    if (!imageUrl) {
      // Fallback to text-only share
      handleTextShare();
      return;
    }

    setIsLoading(true);
    try {
      const imageFile = await fetchImageAsFile(imageUrl);
      
      if (imageFile && canShareFiles) {
        await navigator.share({
          title,
          text: `${text}\n${url}`,
          files: [imageFile],
        });
        toast.success("Shared successfully!");
      } else {
        // Fallback to text share
        handleTextShare();
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Share failed:", error);
        // Fallback to dialog
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Text-only share
  const handleTextShare = async () => {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setIsOpen(true);
      }
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  // Download image
  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const absoluteUrl = imageUrl.startsWith("http") 
        ? imageUrl 
        : `${window.location.origin}${imageUrl}`;
      
      const response = await fetch(absoluteUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      
      toast.success("Image downloaded! You can now share it manually.");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  // Share to WhatsApp directly
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    window.open(whatsappUrl, "_blank");
  };

  // Main share handler
  const handleShare = () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      if (imageUrl && canShareFiles) {
        handleShareWithImage();
      } else {
        handleTextShare();
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        disabled={isLoading}
        className={className}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {size !== "icon" && <span className="ml-2">Share</span>}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {title}</DialogTitle>
            <DialogDescription>
              Choose how you'd like to share this property
            </DialogDescription>
          </DialogHeader>

          {/* Preview Image */}
          {imageUrl && (
            <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary mb-4">
              <img
                src={imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Share with Image (if supported) */}
            {imageUrl && canShareFiles && (
              <Button onClick={handleShareWithImage} className="w-full">
                <ImageIcon className="h-4 w-4 mr-2" />
                Share with Image
              </Button>
            )}

            {/* WhatsApp */}
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              className="w-full bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
            >
              <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
              Share on WhatsApp
            </Button>

            {/* Copy Link */}
            <Button variant="outline" onClick={handleCopyLink} className="w-full">
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            {/* Download Image */}
            {imageUrl && (
              <Button variant="outline" onClick={handleDownloadImage} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Image to Share
              </Button>
            )}
          </div>

          {/* Share Text Preview */}
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg text-sm">
            <p className="font-medium">{title}</p>
            <p className="text-muted-foreground">{text}</p>
            <p className="text-primary text-xs mt-1 truncate">{url}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
