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
  badges?: string[]; // Property badges like "New", "Premium", "Upcoming"
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
  badges = [],
}: ShareWithImageProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Helper function to wrap text
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  // Helper function to draw canvas content
  const drawCanvasContent = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement
  ) => {
    const canvasWidth = 1080;
    const canvasHeight = 1350;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Calculate image dimensions to cover top portion (about 55% of canvas)
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

    // Draw badges at top-left corner
    if (badges && badges.length > 0) {
      let badgeX = 30;
      const badgeY = 30;
      
      badges.forEach((badge) => {
        // Badge background
        ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
        const badgeWidth = ctx.measureText(badge).width + 30;
        const badgeHeight = 45;
        
        // Different colors for different badge types (matching badgeUtils.ts)
        const badgeLower = badge.toLowerCase();
        if (badgeLower.includes('new')) {
          ctx.fillStyle = '#059669'; // Green (bg-green-600)
        } else if (badgeLower.includes('discount') || badgeLower.includes('reduced') || badgeLower.includes('hot')) {
          ctx.fillStyle = '#dc2626'; // Red (bg-red-600)
        } else if (badgeLower.includes('special') || badgeLower.includes('exclusive')) {
          ctx.fillStyle = '#9333ea'; // Purple (bg-purple-600)
        } else if (badgeLower.includes('best seller') || badgeLower.includes('bestseller')) {
          ctx.fillStyle = '#2563eb'; // Blue (bg-blue-600)
        } else if (badgeLower.includes('pre-launch') || badgeLower.includes('prelaunch') || badgeLower.includes('pre launch')) {
          ctx.fillStyle = '#ea580c'; // Orange/Red (bg-orange-600)
        } else if (badgeLower.includes('premium')) {
          ctx.fillStyle = '#d4a853'; // Gold
        } else if (badgeLower.includes('upcoming')) {
          ctx.fillStyle = '#3b82f6'; // Blue
        } else if (badgeLower.includes('featured')) {
          ctx.fillStyle = '#f59e0b'; // Orange
        } else {
          ctx.fillStyle = '#ea580c'; // Orange for custom badges (bg-orange-600)
        }
        
        // Draw rounded badge background
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 8);
        ctx.fill();
        
        // Draw badge text
        ctx.fillStyle = '#ffffff';
        ctx.fillText(badge, badgeX + 15, badgeY + 32);
        
        badgeX += badgeWidth + 15; // Space between badges
      });
    }

    // Add phone number at top-right corner
    const phoneNumber = '+91 9764515697';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'right';
    const phoneWidth = ctx.measureText(phoneNumber).width + 40;
    const phoneX = canvasWidth - 30;
    const phoneY = 30;
    
    // Phone background (semi-transparent dark)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(phoneX - phoneWidth, phoneY, phoneWidth, 50, 8);
    ctx.fill();
    
    // Phone icon and text
    ctx.fillStyle = '#d4a853';
    ctx.fillText('📞 ' + phoneNumber, phoneX - 20, phoneY + 37);

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
    ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    
    // Word wrap for title
    const maxWidth = canvasWidth - (padding * 2);
    const titleLines = wrapText(ctx, title, maxWidth);
    let currentY = textStartY;
    
    // Add semi-transparent background behind title for better readability
    const titleHeight = titleLines.length * 65;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, textStartY - 50, canvasWidth, titleHeight + 20);
    
    // Draw title text
    ctx.fillStyle = '#d4a853';
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
  };

  // Generate shareable image with text overlay
  const generateShareableImage = async (): Promise<Blob | null> => {
    // Use fallback image if imageUrl is not provided or invalid
    const fallbackImage = '/images/hero-building.jpg';
    const imageToUse = imageUrl || fallbackImage;

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        toast.error('Failed to create canvas');
        resolve(null);
        return;
      }

      let timeoutId: NodeJS.Timeout;

      const tryLoadImage = (imgSrc: string, isFallback: boolean = false) => {
        const img = new Image();
        
        img.onload = () => {
          if (timeoutId) clearTimeout(timeoutId);
          
          try {
            drawCanvasContent(ctx, canvas, img);
            
            // Convert to blob
            canvas.toBlob((blob) => {
              if (blob) {
                console.log(`Canvas blob created${isFallback ? ' with fallback image' : ''}: ${blob.size} bytes`);
                resolve(blob);
              } else {
                console.error('Failed to create blob from canvas');
                toast.error('Failed to generate share image');
                resolve(null);
              }
            }, 'image/jpeg', 0.9);
          } catch (error) {
            console.error('Error drawing canvas:', error);
            toast.error('Failed to generate share image');
            resolve(null);
          }
        };

        img.onerror = () => {
          if (timeoutId) clearTimeout(timeoutId);
          console.error(`Failed to load image: ${imgSrc}`);
          
          // Try fallback image if original failed and we haven't tried fallback yet
          if (!isFallback && imgSrc !== fallbackImage) {
            console.log('Trying fallback image:', fallbackImage);
            toast.info('Using default image...');
            tryLoadImage(fallbackImage, true);
          } else {
            console.error('All image loading attempts failed');
            toast.error('Failed to load image for sharing');
            resolve(null);
          }
        };

        // Set timeout to prevent infinite hang
        timeoutId = setTimeout(() => {
          console.error('Image loading timeout for:', imgSrc);
          
          // Try fallback if timeout on original image
          if (!isFallback && imgSrc !== fallbackImage) {
            console.log('Timeout - trying fallback image:', fallbackImage);
            tryLoadImage(fallbackImage, true);
          } else {
            toast.error('Image loading timeout');
            resolve(null);
          }
        }, 10000); // 10 second timeout

        img.src = imgSrc;
      };

      // Start loading the image
      tryLoadImage(imageToUse);
    });
  };

  const handleShare = async () => {
    setIsSharing(true);
    setShared(false);

    try {
      // Generate the shareable image
      const imageBlob = await generateShareableImage();

      if (!imageBlob) {
        toast.error('Failed to generate share image');
        setIsSharing(false);
        return;
      }

      // Create formatted message with all details
      const shareMessage = `🏠 *${title}*${builder ? `\nby ${builder}` : ''}${location ? `\n📍 ${location}` : ''}${price ? `\n💰 ${price}` : ''}\n\n🔗 ${url}\n\n📞 Contact us: +91 9764515697\n\n━━━━━━━━━━━━━━━━\nNivaara Realty Solutions\n"We Build Trust"`;

      // Copy message to clipboard
      await navigator.clipboard.writeText(shareMessage);

      // Download the image
      const downloadUrl = URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_nivaara.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      toast.success('Message copied & image downloaded! Paste in WhatsApp and attach the image.');
      setShared(true);

      // Reset shared state after 3 seconds
      setTimeout(() => setShared(false), 3000);
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleShare}
        disabled={isSharing}
      >
        {isSharing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creating...
          </>
        ) : shared ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </>
        )}
      </Button>
    </>
  );
}
