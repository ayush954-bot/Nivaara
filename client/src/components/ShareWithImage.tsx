import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Share2, Copy, Check, MessageCircle, Loader2, Download, Image as ImageIcon, ExternalLink } from "lucide-react";
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

  // Full share message with title, text, and URL
  const fullShareMessage = `*${title}*\n\n${text}\n\n🔗 ${url}`;

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
      const fileName = `${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.jpg`;
      return new File([blob], fileName, { type: blob.type || "image/jpeg" });
    } catch (error) {
      console.error("Error fetching image:", error);
      return null;
    }
  };

  // Share with image AND text using Web Share API
  const handleShareWithImage = async () => {
    if (!imageUrl) {
      handleTextShare();
      return;
    }

    setIsLoading(true);
    try {
      const imageFile = await fetchImageAsFile(imageUrl);
      
      if (imageFile && canShareFiles) {
        // Share with both image and full text content
        await navigator.share({
          title: title,
          text: fullShareMessage,
          files: [imageFile],
        });
        toast.success("Shared successfully!");
        setIsOpen(false);
      } else {
        // Fallback to text share
        handleTextShare();
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Share with image failed:", error);
        // Try text-only share as fallback
        try {
          await navigator.share({
            title: title,
            text: fullShareMessage,
            url: url,
          });
          toast.success("Shared successfully!");
        } catch (textError: any) {
          if (textError.name !== "AbortError") {
            setIsOpen(true);
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Text-only share (includes title, description, and URL)
  const handleTextShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: text,
        url: url,
      });
      toast.success("Shared successfully!");
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setIsOpen(true);
      }
    }
  };

  // Copy full message to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullShareMessage);
      setCopied(true);
      toast.success("Message copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  // Download image for manual sharing
  const handleDownloadImage = async () => {
    if (!imageUrl) return;
    
    setIsLoading(true);
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
      
      // Also copy the message to clipboard
      await navigator.clipboard.writeText(fullShareMessage);
      
      toast.success("Image downloaded & message copied! Paste the message when sharing.");
    } catch (error) {
      toast.error("Failed to download image");
    } finally {
      setIsLoading(false);
    }
  };

  // Share to WhatsApp directly with text (WhatsApp will fetch OG image from URL)
  const handleWhatsAppShare = () => {
    const whatsappMessage = `*${title}*\n\n${text}\n\n🔗 ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  // Share to WhatsApp with image download first
  const handleWhatsAppWithImage = async () => {
    if (!imageUrl) {
      handleWhatsAppShare();
      return;
    }

    setIsLoading(true);
    try {
      // Download the image first
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
      
      // Copy message to clipboard
      await navigator.clipboard.writeText(fullShareMessage);
      
      toast.success("Image saved! Opening WhatsApp - attach the image and paste the message.", {
        duration: 5000,
      });
      
      // Small delay then open WhatsApp
      setTimeout(() => {
        window.open("https://wa.me/", "_blank");
      }, 1000);
      
    } catch (error) {
      toast.error("Failed to prepare share");
      handleWhatsAppShare();
    } finally {
      setIsLoading(false);
    }
  };

  // Main share handler - always show dialog for better UX
  const handleShare = () => {
    setIsOpen(true);
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

          {/* Preview Card */}
          <div className="border rounded-lg overflow-hidden bg-card">
            {/* Preview Image */}
            {imageUrl && (
              <div className="relative aspect-video bg-secondary">
                <img
                  src={imageUrl.startsWith("http") ? imageUrl : `${window.location.origin}${imageUrl}`}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Preview Text */}
            <div className="p-3">
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{text}</p>
              <p className="text-xs text-primary mt-2 flex items-center">
                <ExternalLink className="h-3 w-3 mr-1" />
                {new URL(url).hostname}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {/* Best Option: Share with Image (if supported) */}
            {imageUrl && canShareFiles && (
              <Button 
                onClick={handleShareWithImage} 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4 mr-2" />
                )}
                Share with Image & Text
              </Button>
            )}

            {/* WhatsApp with Image */}
            {imageUrl && (
              <Button
                variant="outline"
                onClick={handleWhatsAppWithImage}
                className="w-full bg-green-500/10 hover:bg-green-500/20 border-green-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                )}
                WhatsApp with Image
              </Button>
            )}

            {/* WhatsApp Text Only */}
            <Button
              variant="outline"
              onClick={handleWhatsAppShare}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp (Link Only)
            </Button>

            {/* Copy Full Message */}
            <Button variant="outline" onClick={handleCopyLink} className="w-full">
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy Message"}
            </Button>

            {/* Download Image + Copy Message */}
            {imageUrl && (
              <Button 
                variant="ghost" 
                onClick={handleDownloadImage} 
                className="w-full text-muted-foreground"
                disabled={isLoading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Image + Copy Text
              </Button>
            )}
          </div>

          {/* Message Preview */}
          <div className="mt-2 p-3 bg-secondary/30 rounded-lg text-xs font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
            {fullShareMessage}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
