// Share component - includes formatted text with property/project details
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, MessageCircle } from "lucide-react";
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

  // Format the share message with property details
  const formatShareMessage = () => {
    const message = `🏠 *${title}*

${text}

🔗 ${url}

Shared via Nivaara Realty Solutions`;
    return message;
  };

  // Plain text version (without markdown)
  const formatPlainMessage = () => {
    return `🏠 ${title}\n\n${text}\n\n🔗 ${url}\n\nShared via Nivaara Realty Solutions`;
  };

  const handleShare = async () => {
    const shareMessage = formatPlainMessage();
    
    // On mobile, use native share with text and URL
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `🏠 ${title}\n\n${text}\n\nShared via Nivaara Realty Solutions`,
          url: url,
        });
        return;
      } catch (e) {
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

  const handleWhatsAppShare = () => {
    const message = formatShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {size !== "icon" && <span className="ml-2">{copied ? "Copied!" : "Share"}</span>}
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
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Share on WhatsApp
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

          {/* Message preview */}
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Message preview:</p>
            <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap font-sans">
              {formatShareMessage()}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
