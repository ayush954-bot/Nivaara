// Share component - includes formatted text with property/project details and image
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, MessageCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [copied, setCopied] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Format the share message with property details (WhatsApp markdown)
  const formatShareMessage = () => {
    const message = `🏠 *${title}*

${text}

🔗 ${url}

Shared via Nivaara Realty Solutions`;
    return message;
  };

  // Plain text version (without markdown bold)
  const formatPlainMessage = () => {
    return `🏠 ${title}\n\n${text}\n\n🔗 ${url}\n\nShared via Nivaara Realty Solutions`;
  };

  // Fetch image and convert to File object for sharing
  const fetchImageAsFile = async (imageUrl: string): Promise<File | null> => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const fileName = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
      return new File([blob], fileName, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      console.error('Failed to fetch image:', error);
      return null;
    }
  };

  // Create a text file with the message to share alongside image
  const createTextFile = (message: string): File => {
    const blob = new Blob([message], { type: 'text/plain' });
    return new File([blob], 'property-details.txt', { type: 'text/plain' });
  };

  const handleShare = async () => {
    // On mobile, try to use native share with image + text
    if (navigator.share) {
      setIsSharing(true);
      try {
        const shareText = formatPlainMessage();
        
        // Try to share with image if available
        if (imageUrl && navigator.canShare) {
          const imageFile = await fetchImageAsFile(imageUrl);
          if (imageFile) {
            // First try: image + text + url (best case)
            const shareDataWithAll = {
              text: shareText,
              files: [imageFile],
            };
            
            if (navigator.canShare(shareDataWithAll)) {
              await navigator.share(shareDataWithAll);
              setIsSharing(false);
              return;
            }
          }
        }
        
        // Fallback to sharing without image but with text
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        });
        setIsSharing(false);
        return;
      } catch (e) {
        setIsSharing(false);
        // User cancelled - do nothing
        if ((e as Error).name === "AbortError") return;
        // If native share fails, show dialog
      }
    }

    // Show dialog with share options
    setShowDialog(true);
  };

  const handleCopyMessage = async () => {
    const message = formatShareMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied! Paste it anywhere to share.");
      setTimeout(() => setCopied(false), 2000);
      setShowDialog(false);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleWhatsAppShare = async () => {
    setIsSharing(true);
    const shareText = formatPlainMessage();
    
    // On mobile, try to share image + text via WhatsApp using Web Share API
    if (navigator.share && imageUrl) {
      try {
        const imageFile = await fetchImageAsFile(imageUrl);
        if (imageFile && navigator.canShare) {
          // Share image with full text message
          const shareData = {
            text: shareText,
            files: [imageFile],
          };
          
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setIsSharing(false);
            setShowDialog(false);
            return;
          }
        }
      } catch (e) {
        // If sharing with image fails, fall back to URL method
        if ((e as Error).name === "AbortError") {
          setIsSharing(false);
          return;
        }
      }
    }
    
    // Fallback: Open WhatsApp with text (no image but full message)
    const message = formatShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setIsSharing(false);
    setShowDialog(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      setShowDialog(false);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={className}
        disabled={isSharing}
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {size !== "icon" && (
          <span className="ml-2">
            {isSharing ? "Sharing..." : copied ? "Copied!" : "Share"}
          </span>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share {title}</DialogTitle>
          </DialogHeader>
          
          {/* Preview of what will be shared */}
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="flex gap-3">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={title} 
                  className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="font-semibold text-sm line-clamp-1">🏠 {title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{text}</p>
                <p className="text-xs text-primary mt-1 truncate">🔗 {url}</p>
              </div>
            </div>
          </div>

          {/* Share options */}
          <div className="grid gap-3">
            <Button 
              onClick={handleWhatsAppShare} 
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
              disabled={isSharing}
            >
              {isSharing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4 mr-2" />
              )}
              {imageUrl ? "Share with Image on WhatsApp" : "Share on WhatsApp"}
            </Button>
            
            <Button 
              onClick={handleCopyMessage} 
              variant="outline" 
              className="w-full"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Message with Details
            </Button>

            <Button 
              onClick={handleCopyLink} 
              variant="ghost" 
              className="w-full text-muted-foreground"
            >
              Copy Link Only
            </Button>
          </div>

          {/* Info about image sharing */}
          {imageUrl && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              📷 Image + text will be shared together on mobile
            </p>
          )}

          {/* Message preview */}
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Message that will be shared:</p>
            <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap font-sans">
              {formatShareMessage()}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
