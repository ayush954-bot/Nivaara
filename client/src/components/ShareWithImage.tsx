import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check } from "lucide-react";
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

  const handleShare = async () => {
    // On mobile, use native share (just shares the URL)
    if (navigator.share) {
      try {
        await navigator.share({ url });
        return;
      } catch (e) {
        // User cancelled - do nothing
        if ((e as Error).name === "AbortError") return;
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleShare}
      className={className}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {size !== "icon" && <span className="ml-2">{copied ? "Copied!" : "Share"}</span>}
    </Button>
  );
}
