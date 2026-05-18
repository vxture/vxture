import { describe, it, expect } from "vitest";
import { BadRequestException } from "@nestjs/common";

import { ModelAdminService } from "./model-admin.service";
import type {
  CreateAiModelBody,
  UpdateAiModelBody,
} from "./model-admin.service";

// ── helpers ───────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const svc = new ModelAdminService(null as any);

const normalizeCreate = (body: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svc as any).normalizeCreateModel(body) as ReturnType<
    ModelAdminService["createModel"]
  >;
const normalizeUpdate = (body: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svc as any).normalizeUpdateModel(body) as ReturnType<
    ModelAdminService["updateModel"]
  >;

const VALID_BASE: CreateAiModelBody = {
  modelCode: "gpt-4o",
  modelName: "GPT-4o",
  provider: "openai",
  endpointUrl: "https://api.openai.com/v1",
  protocol: "openai",
  capabilities: ["chat"],
};

// ── normalizeCreateModel ──────────────────────────────────────────────────────

describe("normalizeCreateModel", () => {
  describe("required field validation", () => {
    it("throws when capabilities is absent", () => {
      const body = { ...VALID_BASE };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (body as any).capabilities;
      expect(() => normalizeCreate(body)).toThrow(BadRequestException);
    });

    it("throws when capabilities is not an array", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, capabilities: "chat" }),
      ).toThrow(BadRequestException);
    });

    it("throws when capabilities is empty after filtering", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, capabilities: [] }),
      ).toThrow(BadRequestException);
    });

    it("throws when capabilities contains only whitespace strings", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, capabilities: ["  ", ""] }),
      ).toThrow(BadRequestException);
    });

    it("throws when modelCode is missing", () => {
      expect(() => normalizeCreate({ ...VALID_BASE, modelCode: "" })).toThrow(
        BadRequestException,
      );
    });

    it("throws when modelCode is whitespace", () => {
      expect(() => normalizeCreate({ ...VALID_BASE, modelCode: "  " })).toThrow(
        BadRequestException,
      );
    });

    it("throws when modelName is missing", () => {
      expect(() => normalizeCreate({ ...VALID_BASE, modelName: "" })).toThrow(
        BadRequestException,
      );
    });

    it("throws when provider is missing", () => {
      expect(() => normalizeCreate({ ...VALID_BASE, provider: "" })).toThrow(
        BadRequestException,
      );
    });

    it("throws when endpointUrl is not a valid URL", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, endpointUrl: "not-a-url" }),
      ).toThrow(BadRequestException);
    });

    it("throws when protocol is missing", () => {
      expect(() => normalizeCreate({ ...VALID_BASE, protocol: "" })).toThrow(
        BadRequestException,
      );
    });
  });

  describe("defaults", () => {
    it('defaults modelType to "chat"', () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).modelType).toBe("chat");
    });

    it("defaults supportsStreaming to true", () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).supportsStreaming).toBe(true);
    });

    it("defaults sort to 999", () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).sort).toBe(999);
    });

    it("defaults description to null", () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).description).toBeNull();
    });

    it("defaults contextWindow to null", () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).contextWindow).toBeNull();
    });

    it("defaults config to null", () => {
      const result = normalizeCreate(VALID_BASE);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).config).toBeNull();
    });
  });

  describe("explicit values", () => {
    it("uses provided modelType", () => {
      const result = normalizeCreate({ ...VALID_BASE, modelType: "embedding" });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).modelType).toBe("embedding");
    });

    it("uses provided supportsStreaming=false", () => {
      const result = normalizeCreate({
        ...VALID_BASE,
        supportsStreaming: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).supportsStreaming).toBe(false);
    });

    it("uses provided sort", () => {
      const result = normalizeCreate({ ...VALID_BASE, sort: 1 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).sort).toBe(1);
    });

    it("accepts contextWindow=0", () => {
      const result = normalizeCreate({ ...VALID_BASE, contextWindow: 0 });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).contextWindow).toBe(0);
    });

    it("throws when contextWindow is negative", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, contextWindow: -1 }),
      ).toThrow(BadRequestException);
    });

    it("throws when maxOutputTokens is negative", () => {
      expect(() =>
        normalizeCreate({ ...VALID_BASE, maxOutputTokens: -512 }),
      ).toThrow(BadRequestException);
    });

    it("deduplicates capabilities", () => {
      const result = normalizeCreate({
        ...VALID_BASE,
        capabilities: ["chat", "chat", "vision"],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).capabilities).toEqual(["chat", "vision"]);
    });

    it("trims capability strings", () => {
      const result = normalizeCreate({
        ...VALID_BASE,
        capabilities: [" chat ", " vision"],
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result as any).capabilities).toEqual(["chat", "vision"]);
    });
  });
});

// ── normalizeUpdateModel ──────────────────────────────────────────────────────

describe("normalizeUpdateModel", () => {
  it("returns an empty object for an empty body", () => {
    const result = normalizeUpdate({} satisfies UpdateAiModelBody);
    expect(result).toEqual({});
  });

  it("passes isActive through", () => {
    const result = normalizeUpdate({
      isActive: false,
    } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).isActive).toBe(false);
  });

  it("throws for an invalid endpointUrl", () => {
    expect(() =>
      normalizeUpdate({
        endpointUrl: "ftp-is-wrong",
      } satisfies UpdateAiModelBody),
    ).toThrow(BadRequestException);
  });

  it("accepts a valid endpointUrl", () => {
    const result = normalizeUpdate({
      endpointUrl: "https://new.endpoint.com/v2",
    } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).endpointUrl).toBe("https://new.endpoint.com/v2");
  });

  it("throws for a negative contextWindow", () => {
    expect(() =>
      normalizeUpdate({ contextWindow: -1 } satisfies UpdateAiModelBody),
    ).toThrow(BadRequestException);
  });

  it("accepts contextWindow=0", () => {
    const result = normalizeUpdate({
      contextWindow: 0,
    } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).contextWindow).toBe(0);
  });

  it("passes description null through", () => {
    const result = normalizeUpdate({
      description: null,
    } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).description).toBeNull();
  });

  it("throws when capabilities is empty", () => {
    expect(() =>
      normalizeUpdate({ capabilities: [] } satisfies UpdateAiModelBody),
    ).toThrow(BadRequestException);
  });

  it("passes supportsStreaming=false through", () => {
    const result = normalizeUpdate({
      supportsStreaming: false,
    } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).supportsStreaming).toBe(false);
  });

  it("passes sort through", () => {
    const result = normalizeUpdate({ sort: 10 } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((result as any).sort).toBe(10);
  });

  it("does not include keys absent from the body", () => {
    const result = normalizeUpdate({ sort: 5 } satisfies UpdateAiModelBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(Object.keys(result as any)).toEqual(["sort"]);
  });
});
