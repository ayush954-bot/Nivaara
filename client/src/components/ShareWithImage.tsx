import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
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
  variant = "outline",
  size = "default",
  className,
}: ShareWithImageProps) {
  const [copied, setCopied] = useState(false);

  // Simple share - use native share API or copy to clipboard
  const handleShare = async () => {
    // Try native share API first (works on mobile)
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: title,
          text: text,
          url: url,
        });
        return;
      } catch (error: any) {
        // User cancelled or share failed - fall through to copy
        if (error.name === "AbortError") return;
      }
    }

    // Fallback: copy link to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied! Share it anywhere to see the preview.");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <Check className="h-4 w-4" />
      ) : (
        <Share2 className="h-4 w-4" />
      )}
      {size !== "icon" && <span className="ml-2">{copied ? "Copied!" : "Share"}</span>}
    </Button>
  );
}
