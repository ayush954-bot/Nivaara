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
        console.log("[OG Meta] Social media crawler detected:", userAgent.substring(0, 50));
        const dynamicMeta = await getDynamicOGMeta(url);
        if (dynamicMeta) {
          console.log("[OG Meta] Injecting dynamic meta tags for:", url);
          // Replace the entire OG section with dynamic tags
          template = replaceOGTags(template, dynamicMeta);
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
    console.log("[OG Meta] Project match found:", projectMatch[1]);
    const meta = await getProjectOGMeta(projectMatch[1]);
    if (meta) {
      console.log("[OG Meta] Project meta generated:", meta.title);
      return generateOGMetaTags(meta);
    }
  }
  
  // Check for property pages: /properties/id or /properties/slug
  const propertyMatch = url.match(/\/properties\/([^/?]+)/);
  if (propertyMatch) {
    console.log("[OG Meta] Property match found:", propertyMatch[1]);
    const meta = await getPropertyOGMeta(propertyMatch[1]);
    if (meta) {
      console.log("[OG Meta] Property meta generated:", meta.title);
      return generateOGMetaTags(meta);
    }
  }
  
  return null;
}

function replaceOGTags(html: string, newTags: string): string {
  // Remove existing OG and Twitter tags
  let result = html;
  
  // Remove og: meta tags
  result = result.replace(/<meta property="og:[^"]*"[^>]*>\s*/g, "");
  
  // Remove twitter: meta tags
  result = result.replace(/<meta name="twitter:[^"]*"[^>]*>\s*/g, "");
  
  // Remove the comment markers
  result = result.replace(/<!-- Open Graph \/ Facebook -->\s*/g, "");
  result = result.replace(/<!-- Twitter -->\s*/g, "");
  
  // Insert new tags before </head>
  result = result.replace("</head>", `${newTags}\n  </head>`);
  
  return result;
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

  // Handle all other routes - serve pre-generated static files for social crawlers
  app.use("*", async (req, res) => {
    const url = req.originalUrl;
    const userAgent = req.get("user-agent") || "";
    const indexPath = path.resolve(distPath, "index.html");
    
    // Check if this is a social media crawler requesting a project/property page
    if (isSocialMediaCrawler(userAgent)) {
      console.log("[Production OG] Social crawler detected:", userAgent.substring(0, 50), "URL:", url);
      
      // Try to serve pre-generated static file for projects
      const projectMatch = url.match(/\/projects\/([^/?]+)/);
      if (projectMatch) {
        const slug = projectMatch[1];
        const staticFilePath = path.join(distPath, "projects", slug, "index.html");
        console.log("[Production OG] Looking for project file:", staticFilePath);
        
        if (fs.existsSync(staticFilePath)) {
          console.log("[Production OG] Serving pre-generated file for project:", slug);
          const html = await fs.promises.readFile(staticFilePath, "utf-8");
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
          return;
        }
        console.log("[Production OG] Project file not found, falling back to dynamic");
      }
      
      // Try to serve pre-generated static file for properties
      const propertyMatch = url.match(/\/properties\/([^/?]+)/);
      if (propertyMatch) {
        const slug = propertyMatch[1];
        const staticFilePath = path.join(distPath, "properties", slug, "index.html");
        console.log("[Production OG] Looking for property file:", staticFilePath);
        
        if (fs.existsSync(staticFilePath)) {
          console.log("[Production OG] Serving pre-generated file for property:", slug);
          const html = await fs.promises.readFile(staticFilePath, "utf-8");
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
          return;
        }
        console.log("[Production OG] Property file not found, falling back to dynamic");
      }
      
      // Fallback to dynamic generation if static file not found
      try {
        let html = await fs.promises.readFile(indexPath, "utf-8");
        const dynamicMeta = await getDynamicOGMeta(url);
        if (dynamicMeta) {
          console.log("[Production OG] Using dynamic meta generation");
          html = replaceOGTags(html, dynamicMeta);
        }
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
        return;
      } catch (error) {
        console.error("[Production OG] Error:", error);
      }
    }
    
    res.sendFile(indexPath);
  });
}
