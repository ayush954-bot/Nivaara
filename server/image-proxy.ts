/**
 * /api/image-proxy?url=<encoded-url>
 *
 * Fetches an external image server-side and pipes it back to the client
 * with CORS headers set. This lets the browser canvas draw the image
 * without tainting it (which would block canvas.toBlob()).
 *
 * Security: only allows http/https URLs; blocks private IPs.
 */
import { Router } from "express";
import https from "https";
import http from "http";
import { URL } from "url";

export const imageProxyRouter = Router();

// Block private/loopback IP ranges to prevent SSRF
function isPrivateHost(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.16.") ||
    hostname.startsWith("172.17.") ||
    hostname.startsWith("172.18.") ||
    hostname.startsWith("172.19.") ||
    hostname.startsWith("172.2") ||
    hostname.startsWith("172.30.") ||
    hostname.startsWith("172.31.") ||
    hostname === "0.0.0.0"
  );
}

imageProxyRouter.get("/api/image-proxy", (req, res) => {
  const rawUrl = req.query.url as string | undefined;

  if (!rawUrl) {
    res.status(400).send("Missing url parameter");
    return;
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    res.status(400).send("Invalid URL");
    return;
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    res.status(400).send("Only http/https URLs are allowed");
    return;
  }

  if (isPrivateHost(parsed.hostname)) {
    res.status(403).send("Forbidden");
    return;
  }

  const lib = parsed.protocol === "https:" ? https : http;

  const proxyReq = lib.get(
    rawUrl,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NivaaraBot/1.0)",
        Accept: "image/*",
      },
      timeout: 10000,
    },
    (proxyRes) => {
      const contentType = proxyRes.headers["content-type"] ?? "image/jpeg";

      // Only allow image content types
      if (!contentType.startsWith("image/")) {
        res.status(400).send("Not an image");
        proxyRes.resume();
        return;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader("Cache-Control", "public, max-age=86400"); // cache 1 day
      res.setHeader("Access-Control-Allow-Origin", "*");

      proxyRes.pipe(res);
    }
  );

  proxyReq.on("error", (err) => {
    console.error("[image-proxy] fetch error:", err.message);
    if (!res.headersSent) {
      res.status(502).send("Failed to fetch image");
    }
  });

  proxyReq.on("timeout", () => {
    proxyReq.destroy();
    if (!res.headersSent) {
      res.status(504).send("Image fetch timed out");
    }
  });
});
