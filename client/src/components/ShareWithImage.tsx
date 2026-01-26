// Share component - includes image + formatted text with property details + link
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

  // Format the share message with property details and link
  const formatShareMessage = () => {
    return `🏠 *${title}*

${text}

🔗 ${url}

Shared via Nivaara Realty Solutions`;
  };

  // Plain text version for sharing (link included in text)
  const formatPlainMessageWithLink = () => {
    return `🏠 ${title}

${text}

🔗 ${url}

Shared via Nivaara Realty Solutions`;
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

  const handleShare = async () => {
    // On mobile, try to use native share
    if (navigator.share) {
      setIsSharing(true);
      try {
        const shareTextWithLink = formatPlainMessageWithLink();
        
        // Try to share with image if available
        if (imageUrl && navigator.canShare) {
          const imageFile = await fetchImageAsFile(imageUrl);
          if (imageFile) {
            // Share image + text (text includes the link)
            const shareData = {
              text: shareTextWithLink,
              files: [imageFile],
            };
            
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              setIsSharing(false);
              return;
            }
          }
        }
        
        // Fallback to sharing without image but with text + link
        await navigator.share({
          title: title,
          text: shareTextWithLink,
        });
        setIsSharing(false);
        return;
      } catch (e) {
        setIsSharing(false);
        if ((e as Error).name === "AbortError") return;
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
    const shareTextWithLink = formatPlainMessageWithLink();
    
    // On mobile, try to share image + text (with link in text) via Web Share API
    if (navigator.share && imageUrl) {
      try {
        const imageFile = await fetchImageAsFile(imageUrl);
        if (imageFile && navigator.canShare) {
          // Share image + text (text includes the link)
          const shareData = {
            text: shareTextWithLink,
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
        if ((e as Error).name === "AbortError") {
          setIsSharing(false);
          return;
        }
      }
    }
    
    // Fallback: Open WhatsApp with text + link (no image)
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

          {/* Info about sharing */}
          {imageUrl && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              📷 Image + text + link will be shared together on mobile
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
