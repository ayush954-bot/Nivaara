// Share component - shares image + copies text to clipboard for user to paste
// Note: Web Share API has a known limitation where text is stripped when sharing files
// Solution: Copy text to clipboard first, then share image, user pastes text after
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Copy, MessageCircle, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [step, setStep] = useState<1 | 2>(1);

  // Format the share message with property details and link
  const formatShareMessage = () => {
    return `🏠 *${title}*

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

  const handleShare = () => {
    setStep(1);
    setShowDialog(true);
  };

  // Step 1: Copy text to clipboard
  const handleCopyText = async () => {
    const message = formatShareMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Text copied! Now share the image and paste the text.");
      setStep(2);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  // Step 2: Share image only
  const handleShareImage = async () => {
    if (!imageUrl) return;
    
    setIsSharing(true);
    try {
      const imageFile = await fetchImageAsFile(imageUrl);
      if (imageFile && navigator.share && navigator.canShare) {
        const shareData = { files: [imageFile] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success("Image shared! Now paste the copied text in WhatsApp.");
          setShowDialog(false);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Failed to share image");
      }
    }
    setIsSharing(false);
  };

  // Alternative: Share text only via WhatsApp URL (no image)
  const handleWhatsAppTextOnly = () => {
    const message = formatShareMessage();
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
    setShowDialog(false);
  };

  // Copy message only
  const handleCopyMessage = async () => {
    const message = formatShareMessage();
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      toast.success("Message copied!");
      setTimeout(() => setCopied(false), 2000);
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
            {imageUrl && (
              <DialogDescription>
                To share image with text on WhatsApp, follow these 2 steps:
              </DialogDescription>
            )}
          </DialogHeader>
          
          {imageUrl ? (
            <>
              {/* Two-step process for image + text */}
              <div className="space-y-4">
                {/* Step 1: Copy Text */}
                <div className={`p-4 rounded-lg border-2 ${step === 1 ? 'border-primary bg-primary/5' : 'border-muted bg-muted/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                      1
                    </div>
                    <span className="font-semibold">Copy the message</span>
                    {step === 2 && <Check className="h-4 w-4 text-green-500 ml-auto" />}
                  </div>
                  <Button 
                    onClick={handleCopyText}
                    variant={step === 1 ? "default" : "outline"}
                    className="w-full"
                    disabled={step !== 1}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {step === 2 ? "Text Copied ✓" : "Copy Text with Link"}
                  </Button>
                </div>

                {/* Step 2: Share Image */}
                <div className={`p-4 rounded-lg border-2 ${step === 2 ? 'border-primary bg-primary/5' : 'border-muted bg-muted/50'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'}`}>
                      2
                    </div>
                    <span className="font-semibold">Share the image</span>
                  </div>
                  <Button 
                    onClick={handleShareImage}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                    disabled={step !== 2 || isSharing}
                  >
                    {isSharing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Image className="h-4 w-4 mr-2" />
                    )}
                    Share Image on WhatsApp
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    After sharing, paste the copied text in the chat
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-3">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold line-clamp-1">🏠 {title}</p>
                      <p className="text-muted-foreground line-clamp-1">{text}</p>
                      <p className="text-primary truncate">🔗 {url}</p>
                    </div>
                  </div>
                </div>

                {/* Alternative option */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2 text-center">Or share text only (without image):</p>
                  <Button 
                    onClick={handleWhatsAppTextOnly}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Share Text Only on WhatsApp
                  </Button>
                </div>
              </div>
            </>
          ) : (
            /* No image - simple share options */
            <div className="grid gap-3">
              <Button 
                onClick={handleWhatsAppTextOnly} 
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
                Copy Message
              </Button>

              {/* Message preview */}
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">Message:</p>
                <pre className="text-xs bg-muted p-2 rounded whitespace-pre-wrap font-sans">
                  {formatShareMessage()}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
