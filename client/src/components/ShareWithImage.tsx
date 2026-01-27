// Share component - generates a shareable image with property details overlaid
// Single-tap share: creates image with photo + text + branding, then shares
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ShareWithImageProps {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  // Additional property details for the overlay
  location?: string;
  price?: string;
  builder?: string;
}

export function ShareWithImage({
  title,
  text,
  url,
  imageUrl,
  variant = "outline",
  size = "default",
  className,
  location,
  price,
  builder,
}: ShareWithImageProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate shareable image with text overlay
  const generateShareableImage = async (): Promise<Blob | null> => {
    if (!imageUrl) return null;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      const img = new Image();
      // Don't set crossOrigin for local images to avoid CORS issues
      
      img.onload = () => {
        // Set canvas size (Instagram/WhatsApp friendly 1080x1350 or 4:5 ratio)
        const canvasWidth = 1080;
        const canvasHeight = 1350;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Calculate image dimensions to cover top portion (about 60% of canvas)
        const imageHeight = canvasHeight * 0.55;
        const imageAspect = img.width / img.height;
        const targetAspect = canvasWidth / imageHeight;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imageAspect > targetAspect) {
          // Image is wider - fit height, crop width
          drawHeight = imageHeight;
          drawWidth = imageHeight * imageAspect;
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller - fit width, crop height
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imageAspect;
          drawX = 0;
          drawY = 0;
        }

        // Fill background with dark color
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw the property image at top
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Add gradient overlay on image for better text visibility
        const gradient = ctx.createLinearGradient(0, imageHeight - 150, 0, imageHeight);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, imageHeight - 150, canvasWidth, 150);

        // Text section starts after image
        const textStartY = imageHeight + 40;
        const padding = 60;

        // Property name (large, bold, golden)
        ctx.fillStyle = '#d4a853';
        ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'left';
        
        // Word wrap for title
        const maxWidth = canvasWidth - (padding * 2);
        const titleLines = wrapText(ctx, title, maxWidth);
        let currentY = textStartY;
        
        titleLines.forEach((line) => {
          ctx.fillText(line, padding, currentY);
          currentY += 65;
        });

        // Builder name
        if (builder) {
          currentY += 10;
          ctx.fillStyle = '#94a3b8';
          ctx.font = '36px system-ui, -apple-system, sans-serif';
          ctx.fillText(`by ${builder}`, padding, currentY);
          currentY += 55;
        }

        // Location with icon
        if (location) {
          currentY += 15;
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '38px system-ui, -apple-system, sans-serif';
          ctx.fillText(`📍 ${location}`, padding, currentY);
          currentY += 55;
        }

        // Price
        if (price) {
          currentY += 5;
          ctx.fillStyle = '#22c55e';
          ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
          ctx.fillText(`💰 ${price}`, padding, currentY);
          currentY += 65;
        }

        // Divider line
        currentY += 20;
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, currentY);
        ctx.lineTo(canvasWidth - padding, currentY);
        ctx.stroke();

        // Link
        currentY += 50;
        ctx.fillStyle = '#60a5fa';
        ctx.font = '32px system-ui, -apple-system, sans-serif';
        const shortUrl = url.replace(/^https?:\/\//, '').substring(0, 45) + (url.length > 50 ? '...' : '');
        ctx.fillText(`🔗 ${shortUrl}`, padding, currentY);

        // Branding at bottom
        const brandingY = canvasHeight - 80;
        
        // Branding background
        ctx.fillStyle = 'rgba(212, 168, 83, 0.1)';
        ctx.fillRect(0, brandingY - 40, canvasWidth, 120);
        
        // Branding text
        ctx.fillStyle = '#d4a853';
        ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Nivaara Realty Solutions', canvasWidth / 2, brandingY);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '28px system-ui, -apple-system, sans-serif';
        ctx.fillText('"We Build Trust"', canvasWidth / 2, brandingY + 40);

        // Convert to blob
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.9);
      };

      img.onerror = () => {
        console.error('Failed to load image for sharing');
        resolve(null);
      };

      img.src = imageUrl;
    });
  };

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  const handleShare = async () => {
    setIsSharing(true);

    try {
      // Generate the shareable image
      const imageBlob = await generateShareableImage();
      
      if (imageBlob && navigator.share && navigator.canShare) {
        const file = new File([imageBlob], `${title.replace(/[^a-zA-Z0-9]/g, '_')}_nivaara.jpg`, {
          type: 'image/jpeg',
        });

        const shareData = { files: [file] };
        
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          setShared(true);
          toast.success("Shared successfully!");
          setTimeout(() => setShared(false), 2000);
        } else {
          // Fallback: download the image
          downloadImage(imageBlob);
        }
      } else if (imageBlob) {
        // Fallback for browsers without Web Share API
        downloadImage(imageBlob);
      } else {
        // No image - share text only
        shareTextOnly();
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Failed to share. Try again.");
      }
    }

    setIsSharing(false);
  };

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_nivaara.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Image downloaded! Share it manually.");
  };

  const shareTextOnly = () => {
    const message = `🏠 *${title}*\n\n${text}\n\n🔗 ${url}\n\nShared via Nivaara Realty Solutions`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
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
        ) : shared ? (
          <Check className="h-4 w-4" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        {size !== "icon" && (
          <span className="ml-2">
            {isSharing ? "Creating..." : shared ? "Shared!" : "Share"}
          </span>
        )}
      </Button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
