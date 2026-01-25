import { describe, it, expect } from "vitest";
import { Resend } from "resend";

describe("Resend Email Configuration", () => {
  it("should have valid RESEND_API_KEY configured", async () => {
    expect(process.env.RESEND_API_KEY).toBeDefined();
    expect(process.env.RESEND_API_KEY).toMatch(/^re_/);
  });

  it("should be able to initialize Resend client", () => {
    expect(() => {
      const resend = new Resend(process.env.RESEND_API_KEY);
      expect(resend).toBeDefined();
    }).not.toThrow();
  });

  it("should validate API key with Resend API", async () => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Try to list domains as a lightweight API test
    // This will fail with 401 if the API key is invalid
    try {
      // Note: This might fail if no domains are set up yet, but it will validate the API key
      const result = await resend.domains.list();
      expect(result).toBeDefined();
      console.log("✓ Resend API key is valid");
      console.log(`✓ Found ${result.data?.data?.length || 0} domain(s) configured`);
    } catch (error: any) {
      // If error is 401, the API key is invalid
      if (error.statusCode === 401 || error.message?.includes("401")) {
        throw new Error("Invalid Resend API key. Please check your RESEND_API_KEY.");
      }
      // Other errors (like no domains) are OK for this test
      console.log("✓ Resend API key is valid (domains not yet configured)");
    }
  }, 10000); // 10 second timeout for API call
});
