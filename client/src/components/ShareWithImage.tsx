// Share component — generates a professional shareable image with property details
// Layout: top 60% = real property photo (or type-specific fallback from CDN),
//         bottom 40% = dark info panel with title, location, price, link, branding.
// No text is drawn over the photo — all text lives in the dedicated info panel.
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getFallbackImageUrl } from "@/lib/propertyFallbackImage";

interface ShareWithImageProps {
  title: string;
  text: string;
  url: string;
  imageUrl?: string;
  propertyType?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  location?: string;
  price?: string;
  builder?: string;
  badges?: string[];
}

// ─── helpers ────────────────────────────────────────────────────────────────

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines = 2
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = test;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  // Truncate last line with ellipsis if title was cut
  if (lines.length === maxLines && ctx.measureText(lines[maxLines - 1]).width > maxWidth) {
    while (ctx.measureText(lines[maxLines - 1] + "…").width > maxWidth) {
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1);
    }
    lines[maxLines - 1] += "…";
  }
  return lines;
}

function badgeColor(badge: string): string {
  const b = badge.toLowerCase();
  if (b.includes("new"))                                    return "#059669";
  if (b.includes("hot") || b.includes("discount") || b.includes("reduced")) return "#dc2626";
  if (b.includes("exclusive") || b.includes("special"))    return "#9333ea";
  if (b.includes("pre-launch") || b.includes("pre launch")) return "#ea580c";
  if (b.includes("premium"))                               return "#b45309";
  if (b.includes("upcoming"))                              return "#2563eb";
  if (b.includes("featured"))                              return "#d97706";
  return "#ea580c";
}

// ─── canvas renderer ────────────────────────────────────────────────────────

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (src.startsWith("http://") || src.startsWith("https://")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function buildShareImage(opts: {
  title: string;
  location?: string;
  price?: string;
  builder?: string;
  url: string;
  badges: string[];
  photoSrc: string;
}): Promise<Blob | null> {
  const W = 1080;
  const H = 1350;
  const PHOTO_H = Math.round(H * 0.60); // top 60% = photo
  const INFO_Y  = PHOTO_H;              // bottom 40% = info panel
  const INFO_H  = H - PHOTO_H;
  const PAD     = 56;

  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // ── 1. Draw photo ──────────────────────────────────────────────────────────
  let photoImg: HTMLImageElement | null = null;
  try {
    photoImg = await loadImage(opts.photoSrc);
  } catch {
    // If CDN photo fails (CORS), try without crossOrigin
    try {
      photoImg = await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = opts.photoSrc;
      });
    } catch {
      photoImg = null;
    }
  }

  if (photoImg) {
    // Cover-fit into the photo zone
    const aspect = photoImg.width / photoImg.height;
    const targetAspect = W / PHOTO_H;
    let dw: number, dh: number, dx: number, dy: number;
    if (aspect > targetAspect) {
      dh = PHOTO_H; dw = PHOTO_H * aspect;
      dx = (W - dw) / 2; dy = 0;
    } else {
      dw = W; dh = W / aspect;
      dx = 0; dy = 0;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, PHOTO_H);
    ctx.clip();
    ctx.drawImage(photoImg, dx, dy, dw, dh);
    ctx.restore();
  } else {
    // Solid dark fallback if image completely unavailable
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(0, 0, W, PHOTO_H);
  }

  // ── 2. Thin gradient fade at bottom of photo (no text here) ───────────────
  const fadeH = 80;
  const fade = ctx.createLinearGradient(0, PHOTO_H - fadeH, 0, PHOTO_H);
  fade.addColorStop(0, "rgba(15,23,42,0)");
  fade.addColorStop(1, "rgba(15,23,42,1)");
  ctx.fillStyle = fade;
  ctx.fillRect(0, PHOTO_H - fadeH, W, fadeH);

  // ── 3. Badges (top-left of photo) ─────────────────────────────────────────
  if (opts.badges.length > 0) {
    let bx = 28;
    const by = 28;
    ctx.font = "bold 30px system-ui, sans-serif";
    for (const badge of opts.badges.slice(0, 3)) {
      const bw = ctx.measureText(badge).width + 32;
      const bh = 48;
      ctx.fillStyle = badgeColor(badge);
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(badge, bx + 16, by + bh / 2);
      bx += bw + 12;
    }
  }

  // ── 4. Phone pill (top-right of photo) ────────────────────────────────────
  const phone = "+91 9764515697";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const pw = ctx.measureText("📞 " + phone).width + 32;
  const ph = 48;
  const px = W - 28;
  const py = 28;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.beginPath();
  ctx.roundRect(px - pw, py, pw, ph, 10);
  ctx.fill();
  ctx.fillStyle = "#d4a853";
  ctx.fillText("📞 " + phone, px - 16, py + ph / 2);

  // ── 5. Info panel background ───────────────────────────────────────────────
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, INFO_Y, W, INFO_H);

  // Gold accent bar at top of info panel
  ctx.fillStyle = "#d4a853";
  ctx.fillRect(0, INFO_Y, W, 5);

  // ── 6. Title ───────────────────────────────────────────────────────────────
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "bold 58px system-ui, sans-serif";
  ctx.fillStyle = "#f8fafc";
  const titleLines = wrapText(ctx, opts.title, W - PAD * 2, 2);
  let cy = INFO_Y + 70;
  for (const line of titleLines) {
    ctx.fillText(line, PAD, cy);
    cy += 68;
  }

  // ── 7. Builder (if any) ────────────────────────────────────────────────────
  if (opts.builder) {
    cy += 4;
    ctx.font = "36px system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("by " + opts.builder, PAD, cy);
    cy += 50;
  }

  // ── 8. Location ────────────────────────────────────────────────────────────
  if (opts.location) {
    cy += 8;
    ctx.font = "38px system-ui, sans-serif";
    ctx.fillStyle = "#cbd5e1";
    const locText = "📍 " + opts.location;
    // Truncate if too long
    let loc = locText;
    while (ctx.measureText(loc).width > W - PAD * 2 && loc.length > 10) {
      loc = loc.slice(0, -1);
    }
    if (loc !== locText) loc += "…";
    ctx.fillText(loc, PAD, cy);
    cy += 52;
  }

  // ── 9. Price ───────────────────────────────────────────────────────────────
  if (opts.price) {
    cy += 4;
    ctx.font = "bold 50px system-ui, sans-serif";
    ctx.fillStyle = "#4ade80";
    ctx.fillText("💰 " + opts.price, PAD, cy);
    cy += 62;
  }

  // ── 10. Divider ────────────────────────────────────────────────────────────
  cy += 16;
  ctx.strokeStyle = "#1e3a5f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, cy);
  ctx.lineTo(W - PAD, cy);
  ctx.stroke();
  cy += 36;

  // ── 11. Short URL ──────────────────────────────────────────────────────────
  ctx.font = "32px system-ui, sans-serif";
  ctx.fillStyle = "#60a5fa";
  let shortUrl = opts.url.replace(/^https?:\/\//, "");
  if (shortUrl.length > 48) shortUrl = shortUrl.substring(0, 45) + "…";
  ctx.fillText("🔗 " + shortUrl, PAD, cy);

  // ── 12. Branding strip at very bottom ─────────────────────────────────────
  const brandH = 90;
  const brandY = H - brandH;
  ctx.fillStyle = "rgba(212,168,83,0.12)";
  ctx.fillRect(0, brandY, W, brandH);

  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillStyle = "#d4a853";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Nivaara Realty Solutions  •  \"We Build Trust\"", W / 2, brandY + brandH / 2);

  return new Promise<Blob | null>((res) => {
    canvas.toBlob((b) => res(b), "image/jpeg", 0.92);
  });
}

// ─── component ──────────────────────────────────────────────────────────────

export function ShareWithImage({
  title,
  text,
  url,
  imageUrl,
  propertyType,
  variant = "outline",
  size = "default",
  className,
  location,
  price,
  builder,
  badges = [],
}: ShareWithImageProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [shared, setShared]       = useState(false);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      // Use real property photo if available, else CDN type-specific fallback
      const photoSrc = imageUrl || getFallbackImageUrl(propertyType);

      const imageBlob = await buildShareImage({
        title, location, price, builder, url, badges,
        photoSrc,
      });

      // Formatted WhatsApp message (auto-copied to clipboard)
      const msg = [
        `🏠 *${title}*`,
        builder   ? `by ${builder}` : null,
        location  ? `📍 ${location}` : null,
        price     ? `💰 ${price}` : null,
        "",
        text,
        "",
        `🔗 ${url}`,
        "",
        `📞 *Contact us: +91 9764515697*`,
        "",
        `_Shared via Nivaara Realty Solutions_\n"We Build Trust"`,
      ].filter((l) => l !== null).join("\n");

      try {
        await navigator.clipboard.writeText(msg);
        toast.success("Message copied to clipboard!");
      } catch {
        // clipboard not available — silent
      }

      if (imageBlob && navigator.share && navigator.canShare) {
        const file = new File(
          [imageBlob],
          `${title.replace(/[^a-zA-Z0-9]/g, "_")}_nivaara.jpg`,
          { type: "image/jpeg" }
        );
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file] });
          setShared(true);
          toast.success("Image shared! Paste the copied message in WhatsApp.");
          setTimeout(() => setShared(false), 2500);
        } else {
          downloadBlob(imageBlob, title);
          toast.success("Image downloaded! Paste the copied message in WhatsApp.");
        }
      } else if (imageBlob) {
        downloadBlob(imageBlob, title);
        toast.success("Image downloaded! Paste the copied message in WhatsApp.");
      } else {
        // Canvas unavailable — open WhatsApp web with text only
        window.open(
          `https://wa.me/?text=${encodeURIComponent(msg)}`,
          "_blank"
        );
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        toast.error("Share failed. Please try again.");
      }
    }
    setIsSharing(false);
  };

  return (
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
          {isSharing ? "Creating…" : shared ? "Shared!" : "Share"}
        </span>
      )}
    </Button>
  );
}

function downloadBlob(blob: Blob, title: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
  a.href    = url;
  a.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_nivaara.jpg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
