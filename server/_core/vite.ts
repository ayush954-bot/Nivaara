import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getProjectOGMeta, getPropertyOGMeta, generateOGMetaTags, isSocialMediaCrawler } from "../og-meta";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const userAgent = req.get("user-agent") || "";

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      
      // Handle dynamic OG meta tags for social media crawlers
      if (isSocialMediaCrawler(userAgent)) {
        const dynamicMeta = await getDynamicOGMeta(url);
        if (dynamicMeta) {
          // Replace static OG tags with dynamic ones
          template = template.replace(
            /<!-- Open Graph \/ Facebook -->[\s\S]*?<!-- Twitter -->[\s\S]*?<meta name="twitter:image"[^>]*>/,
            dynamicMeta
          );
        }
      }
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

async function getDynamicOGMeta(url: string): Promise<string | null> {
  // Check for project pages: /projects/slug
  const projectMatch = url.match(/\/projects\/([^/?]+)/);
  if (projectMatch) {
    const meta = await getProjectOGMeta(projectMatch[1]);
    if (meta) return generateOGMetaTags(meta);
  }
  
  // Check for property pages: /properties/id
  const propertyMatch = url.match(/\/properties\/([^/?]+)/);
  if (propertyMatch) {
    const meta = await getPropertyOGMeta(propertyMatch[1]);
    if (meta) return generateOGMetaTags(meta);
  }
  
  return null;
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
