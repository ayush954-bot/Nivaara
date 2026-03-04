// Share component — generates a professional shareable image with property details
// Layout: top 60% = real property photo (or type-specific fallback from CDN),
//         bottom 40% = dark info panel with title, location, price, link, branding.
// All external images are routed through /api/image-proxy to avoid canvas taint (CORS).
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

/** Route any external http/https URL through our server proxy so canvas doesn't taint */
function proxyUrl(src: string): string {
  if (!src) return src;
  if (src.startsWith("data:")) return src; // already a data URL — no proxy needed
  if (src.startsWith("/"))      return src; // relative URL — same origin, no proxy needed
  // External URL — proxy it
  return `/api/image-proxy?url=${encodeURIComponent(src)}`;
}

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
  if (b.includes("new"))                                     return "#059669";
  if (b.includes("hot") || b.includes("discount") || b.includes("reduced")) return "#dc2626";
  if (b.includes("exclusive") || b.includes("special"))     return "#9333ea";
  if (b.includes("pre-launch") || b.includes("pre launch")) return "#ea580c";
  if (b.includes("premium"))                                return "#b45309";
  if (b.includes("upcoming"))                               return "#2563eb";
  if (b.includes("featured"))                               return "#d97706";
  return "#ea580c";
}

// ─── canvas renderer ────────────────────────────────────────────────────────

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // crossOrigin must be set BEFORE src for it to take effect
    img.crossOrigin = "anonymous";
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

  // ── 1. Load photo via proxy (avoids canvas taint) ─────────────────────────
  let photoImg: HTMLImageElement | null = null;
  const proxied = proxyUrl(opts.photoSrc);
  try {
    photoImg = await loadImage(proxied);
  } catch (err) {
    console.warn("[share] image load failed:", err);
    photoImg = null;
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
    // Solid dark gradient fallback if image completely unavailable
    const grad = ctx.createLinearGradient(0, 0, 0, PHOTO_H);
    grad.addColorStop(0, "#1e3a5f");
    grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, PHOTO_H);
    // Draw "No photo" text
    ctx.font = "bold 48px system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("No photo available", W / 2, PHOTO_H / 2);
  }

  // ── 2. Thin gradient fade at bottom of photo ──────────────────────────────
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
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    for (const badge of opts.badges.slice(0, 3)) {
      const bw = ctx.measureText(badge).width + 32;
      const bh = 48;
      ctx.fillStyle = badgeColor(badge);
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 10);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillText(badge, bx + 16, by + bh / 2);
      bx += bw + 12;
    }
  }

  // ── 4. Phone pill (top-right of photo) ────────────────────────────────────
  const phone = "+91 9764515697";
  ctx.font = "bold 30px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const pw = ctx.measureText(phone).width + 64; // leave room for phone icon text
  const ph = 48;
  const px = W - 28;
  const py = 28;
  ctx.fillStyle = "rgba(0,0,0,0.72)";
  ctx.beginPath();
  ctx.roundRect(px - pw, py, pw, ph, 10);
  ctx.fill();
  ctx.fillStyle = "#d4a853";
  ctx.fillText(phone, px - 16, py + ph / 2);

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
    const locText = "  " + opts.location; // leading spaces for pin icon visual
    let loc = locText;
    while (ctx.measureText(loc).width > W - PAD * 2 && loc.length > 10) {
      loc = loc.slice(0, -1);
    }
    if (loc !== locText) loc += "…";
    // Draw a small coloured dot as location marker
    ctx.fillStyle = "#f87171";
    ctx.beginPath();
    ctx.arc(PAD + 10, cy - 12, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#cbd5e1";
    ctx.fillText(opts.location.length > 45 ? opts.location.substring(0, 42) + "…" : opts.location, PAD + 28, cy);
    cy += 52;
  }

  // ── 9. Price ───────────────────────────────────────────────────────────────
  if (opts.price) {
    cy += 12;
    // "Price:" label on its own line
    ctx.font = "32px system-ui, sans-serif";
    ctx.fillStyle = "#86efac";
    ctx.fillText("Price:", PAD, cy);
    cy += 44;
    // Price value on the next line
    ctx.font = "bold 52px system-ui, sans-serif";
    ctx.fillStyle = "#4ade80";
    ctx.fillText(opts.price, PAD, cy);
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
  if (shortUrl.length > 50) shortUrl = shortUrl.substring(0, 47) + "…";
  ctx.fillText(shortUrl, PAD, cy);

  // ── 12. Branding strip at very bottom ─────────────────────────────────────
  const brandH = 90;
  const brandY = H - brandH;
  ctx.fillStyle = "rgba(212,168,83,0.12)";
  ctx.fillRect(0, brandY, W, brandH);

  ctx.font = "bold 36px system-ui, sans-serif";
  ctx.fillStyle = "#d4a853";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText('Nivaara Realty Solutions  \u2022  "We Build Trust"', W / 2, brandY + brandH / 2);

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

      // Formatted WhatsApp message
      const msg = [
        `🏠 *${title}*`,
        builder  ? `by ${builder}` : null,
        location ? `📍 ${location}` : null,
        price    ? `💰 ${price}` : null,
        "",
        text,
        "",
        `🔗 ${url}`,
        "",
        `📞 *Contact us: +91 9764515697*`,
        "",
        `_Shared via Nivaara Realty Solutions_\n"We Build Trust"`,
      ].filter((l) => l !== null).join("\n");

      // Copy message to clipboard (silent fail if not available)
      try {
        await navigator.clipboard.writeText(msg);
      } catch {
        // silent
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
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        toast.success("Opening WhatsApp with property details.");
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        // Last resort: open WhatsApp with text only
        const msg = [
          `🏠 *${title}*`,
          location ? `📍 ${location}` : null,
          price    ? `💰 ${price}` : null,
          "",
          `🔗 ${url}`,
          "",
          `📞 *Contact us: +91 9764515697*`,
        ].filter(Boolean).join("\n");
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
        toast.info("Opened WhatsApp with property details.");
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
