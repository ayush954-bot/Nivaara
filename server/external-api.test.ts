import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import { externalApiRouter } from "./external-api";

// ─── Mock DB ─────────────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

// Mock ENV to provide a master key for testing
vi.mock("./_core/env", () => ({
  ENV: {
    externalApiMasterKey: "test-master-key-12345",
    forgeApiUrl: "https://forge.example.com",
    forgeApiKey: "forge-key",
  },
}));

import { getDb } from "./db";

const MASTER_KEY = "test-master-key-12345";

// ─── Mock DB factory ─────────────────────────────────────────────────────────
function makeMockDb(overrides: Record<string, any> = {}) {
  const insertResult = [{ insertId: 42 }];
  const mockInsert = vi.fn().mockReturnValue({
    values: vi.fn().mockResolvedValue(insertResult),
  });
  const mockUpdate = vi.fn().mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  });
  const mockSelect = vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([]),
        orderBy: vi.fn().mockResolvedValue([]),
      }),
      orderBy: vi.fn().mockResolvedValue([]),
      limit: vi.fn().mockResolvedValue([]),
    }),
  });
  const mockDelete = vi.fn().mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  });
  const mockExecute = vi.fn().mockResolvedValue([[]]);

  return {
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect,
    delete: mockDelete,
    execute: mockExecute,
    ...overrides,
  };
}

// ─── Test app ─────────────────────────────────────────────────────────────────
function buildApp() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());
  app.use(externalApiRouter);
  return app;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("External API — Authentication", () => {
  it("returns 401 when no Authorization header", async () => {
    const app = buildApp();
    const res = await request(app).get("/api/ext/properties");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Missing Authorization/i);
  });

  it("returns 401 when invalid key", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeMockDb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // no key found
            }),
          }),
        }),
      }) as any
    );
    const app = buildApp();
    const res = await request(app)
      .get("/api/ext/properties")
      .set("Authorization", "Bearer invalid-key");
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/Invalid or revoked/i);
  });

  it("accepts master key", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeMockDb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }) as any
    );
    const app = buildApp();
    const res = await request(app)
      .get("/api/ext/keys")
      .set("Authorization", `Bearer ${MASTER_KEY}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("keys");
  });
});

describe("External API — Key Management", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockResolvedValue(makeMockDb() as any);
  });

  it("POST /api/ext/keys requires label", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ext/keys")
      .set("Authorization", `Bearer ${MASTER_KEY}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/label/i);
  });

  it("POST /api/ext/keys creates a key with label", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ext/keys")
      .set("Authorization", `Bearer ${MASTER_KEY}`)
      .send({ label: "Facebook Messaging App" });
    expect(res.status).toBe(201);
    expect(res.body.key).toMatch(/^niv_/);
    expect(res.body.label).toBe("Facebook Messaging App");
  });

  it("non-master key cannot manage keys", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeMockDb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([
                { id: 1, keyHash: "abc", isActive: true },
              ]),
            }),
          }),
        }),
      }) as any
    );
    const app = buildApp();
    const res = await request(app)
      .get("/api/ext/keys")
      .set("Authorization", "Bearer niv_someregularkey");
    expect(res.status).toBe(403);
  });
});

describe("External API — Property Submission", () => {
  beforeEach(() => {
    vi.mocked(getDb).mockResolvedValue(makeMockDb() as any);
  });

  it("returns 400 when required fields are missing", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ext/properties")
      .set("Authorization", `Bearer ${MASTER_KEY}`)
      .send({ title: "Test Property" }); // missing other required fields
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Missing required field/i);
  });

  it("returns 400 for invalid propertyType", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ext/properties")
      .set("Authorization", `Bearer ${MASTER_KEY}`)
      .send({
        title: "Test",
        description: "Test desc",
        propertyType: "InvalidType",
        status: "Ready",
        location: "Pune",
        price: 5000000,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/propertyType/i);
  });

  it("creates a property with valid data", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/api/ext/properties")
      .set("Authorization", `Bearer ${MASTER_KEY}`)
      .send({
        title: "2 BHK Flat in Kharadi",
        description: "Spacious 2 BHK flat with great amenities",
        propertyType: "Flat",
        status: "Ready",
        location: "Kharadi, Pune",
        price: 7500000,
        bedrooms: 2,
        bathrooms: 2,
        area_sqft: 950,
        videoLinks: [{ url: "https://youtube.com/watch?v=abc123", type: "youtube" }],
      });
    expect(res.status).toBe(201);
    expect(res.body.propertyId).toBe(42);
    expect(res.body.slug).toMatch(/2-bhk-flat-in-kharadi/);
    expect(res.body.url).toContain("nivaararealty.com/properties/");
    expect(res.body.videosAdded).toBe(1);
  });

  it("GET /api/ext/properties returns list", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeMockDb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              { id: 1, title: "Test Property", slug: "test-property", propertyType: "Flat" },
            ]),
          }),
        }),
      }) as any
    );
    const app = buildApp();
    const res = await request(app)
      .get("/api/ext/properties")
      .set("Authorization", `Bearer ${MASTER_KEY}`);
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.properties).toHaveLength(1);
  });

  it("GET /api/ext/properties/:id returns 404 for missing property", async () => {
    vi.mocked(getDb).mockResolvedValue(
      makeMockDb({
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // not found
            }),
          }),
        }),
      }) as any
    );
    const app = buildApp();
    const res = await request(app)
      .get("/api/ext/properties/9999")
      .set("Authorization", `Bearer ${MASTER_KEY}`);
    expect(res.status).toBe(404);
  });
});
