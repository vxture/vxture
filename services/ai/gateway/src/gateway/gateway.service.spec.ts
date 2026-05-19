import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

import { GatewayService } from "./gateway.service";
import type { AiModelRecord, ChatRequest } from "../types/gateway.types";

// ── helpers ───────────────────────────────────────────────────────────────────

// Direct instantiation — constructor deps are unused by the methods under test.
/* eslint-disable @typescript-eslint/no-explicit-any */
const svc = new GatewayService(
  null as any,
  null as any,
  null as any,
  null as any,
);
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validate = (req: unknown): void => (svc as any).validateChatRequest(req);

const resolveKey = (model: AiModelRecord): string =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (svc as any).resolveApiKey(model) as string;

function makeModel(overrides: Partial<AiModelRecord> = {}): AiModelRecord {
  return {
    id: "model-1",
    providerId: null,
    modelCode: "gpt-4o",
    modelName: "GPT-4o",
    provider: "openai",
    endpointUrl: "https://api.openai.com/v1",
    protocol: "openai",
    modelType: "chat",
    description: null,
    contextWindow: null,
    maxOutputTokens: null,
    capabilities: ["chat"],
    supportsStreaming: true,
    sort: 999,
    isActive: true,
    config: null,
    createdBy: null,
    updatedBy: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    deletedAt: null,
    ...overrides,
  };
}

function makeRequest(overrides: Partial<ChatRequest> = {}): ChatRequest {
  return {
    tenantId: "tenant-1",
    modelCode: "gpt-4o",
    messages: [{ role: "user", content: "Hello" }],
    ...overrides,
  };
}

// ── validateChatRequest ───────────────────────────────────────────────────────

describe("validateChatRequest", () => {
  it("throws when tenantId is missing", () => {
    expect(() => validate({ ...makeRequest(), tenantId: "" })).toThrow(
      BadRequestException,
    );
  });

  it("throws when tenantId is whitespace", () => {
    expect(() => validate({ ...makeRequest(), tenantId: "   " })).toThrow(
      BadRequestException,
    );
  });

  it("throws when modelCode is missing", () => {
    expect(() => validate({ ...makeRequest(), modelCode: "" })).toThrow(
      BadRequestException,
    );
  });

  it("throws when modelCode is whitespace", () => {
    expect(() => validate({ ...makeRequest(), modelCode: "  " })).toThrow(
      BadRequestException,
    );
  });

  it("throws when messages is an empty array", () => {
    expect(() => validate({ ...makeRequest(), messages: [] })).toThrow(
      BadRequestException,
    );
  });

  it("throws when a message has an invalid role", () => {
    expect(() =>
      validate({
        ...makeRequest(),
        messages: [{ role: "bot", content: "hi" }],
      }),
    ).toThrow(BadRequestException);
  });

  it("throws when a user message has empty content", () => {
    expect(() =>
      validate({ ...makeRequest(), messages: [{ role: "user", content: "" }] }),
    ).toThrow(BadRequestException);
  });

  it("throws when a user message has whitespace-only content", () => {
    expect(() =>
      validate({
        ...makeRequest(),
        messages: [{ role: "user", content: "   " }],
      }),
    ).toThrow(BadRequestException);
  });

  it("accepts an assistant message with empty content when toolCalls are present", () => {
    const req = makeRequest({
      messages: [
        {
          role: "assistant",
          content: "",
          toolCalls: [{ id: "tc-1", name: "get_weather", arguments: {} }],
        },
      ],
    });
    expect(() => validate(req)).not.toThrow();
  });

  it("does not throw for a well-formed request", () => {
    expect(() => validate(makeRequest())).not.toThrow();
  });

  it("does not throw for a multi-turn conversation", () => {
    const req = makeRequest({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Hi" },
        { role: "assistant", content: "Hello!" },
        { role: "user", content: "What is 2+2?" },
      ],
    });
    expect(() => validate(req)).not.toThrow();
  });
});

// ── resolveApiKey ─────────────────────────────────────────────────────────────

describe("resolveApiKey", () => {
  const savedEnv = process.env;

  beforeEach(() => {
    process.env = { ...savedEnv };
  });

  afterEach(() => {
    process.env = savedEnv;
  });

  it("returns empty string when config is null", () => {
    expect(resolveKey(makeModel({ config: null }))).toBe("");
  });

  it("returns empty string when config has no apiKeyEnvVar", () => {
    expect(resolveKey(makeModel({ config: { foo: "bar" } }))).toBe("");
  });

  it("returns empty string when apiKeyEnvVar is not a string", () => {
    expect(resolveKey(makeModel({ config: { apiKeyEnvVar: 42 } }))).toBe("");
  });

  it("returns empty string when apiKeyEnvVar is an empty string", () => {
    expect(resolveKey(makeModel({ config: { apiKeyEnvVar: "" } }))).toBe("");
  });

  it("returns the env var value when it is set", () => {
    process.env["TEST_API_KEY"] = "sk-test-123";
    expect(
      resolveKey(makeModel({ config: { apiKeyEnvVar: "TEST_API_KEY" } })),
    ).toBe("sk-test-123");
  });

  it("throws UnauthorizedException when env var is missing for a public provider", () => {
    delete process.env["MISSING_KEY"];
    expect(() =>
      resolveKey(
        makeModel({
          provider: "openai",
          config: { apiKeyEnvVar: "MISSING_KEY" },
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it("throws for doubao provider when env var is missing", () => {
    delete process.env["DOUBAO_KEY"];
    expect(() =>
      resolveKey(
        makeModel({
          provider: "doubao",
          config: { apiKeyEnvVar: "DOUBAO_KEY" },
        }),
      ),
    ).toThrow(UnauthorizedException);
  });

  it('returns empty string for "private" provider when env var is missing (P1 regression guard)', () => {
    delete process.env["PRIVATE_KEY"];
    expect(
      resolveKey(
        makeModel({
          provider: "private",
          config: { apiKeyEnvVar: "PRIVATE_KEY" },
        }),
      ),
    ).toBe("");
  });

  it('returns empty string for "custom" provider when env var is missing (P1 regression guard)', () => {
    delete process.env["CUSTOM_KEY"];
    expect(
      resolveKey(
        makeModel({
          provider: "custom",
          config: { apiKeyEnvVar: "CUSTOM_KEY" },
        }),
      ),
    ).toBe("");
  });

  it('returns empty string for "self-hosted" provider when env var is missing (P1 regression guard)', () => {
    delete process.env["SELFHOSTED_KEY"];
    expect(
      resolveKey(
        makeModel({
          provider: "self-hosted",
          config: { apiKeyEnvVar: "SELFHOSTED_KEY" },
        }),
      ),
    ).toBe("");
  });
});
