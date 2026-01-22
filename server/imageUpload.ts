import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Image upload router - handles property image uploads to S3
 */
export const imageUploadRouter = router({
  /**
   * Upload a single image to S3
   * Input: base64 encoded image data
   * Output: S3 URL
   */
  uploadImage: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(), // e.g., "image/jpeg", "image/png"
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validate user is admin
        if (ctx.user.role !== "admin") {
          throw new Error("Only admins can upload images");
        }

        // Convert base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique file key with random suffix to prevent enumeration
        const fileExtension = input.mimeType.split("/")[1];
        const randomSuffix = nanoid(10);
        const fileKey = `property-images/${Date.now()}-${randomSuffix}.${fileExtension}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

        return {
          success: true,
          url,
        };
      } catch (error) {
        console.error("Image upload error:", error);
        throw new Error("Failed to upload image");
      }
    }),
});
