/**
 * HiggsFieldProvider — image generation via the Higgsfield CLI.
 *
 * Implements AIProvider for the "image-generation" capability by shelling out
 * to the `higgsfield` CLI binary. The CLI handles auth, workspace routing, job
 * polling, and CDN delivery; this provider is a typed wrapper around that.
 *
 * Configuration (lib/config.ts → aiProviderConfig.higgsfield):
 *   model       — default CLI job_set_type key (default: "nano-banana-pro")
 *   timeoutMs   — generation wall-clock timeout in ms (default: 110_000)
 *   maxRetries  — retry attempts (handled by AIService.execute)
 *   apiKey      — unused; Higgsfield auth lives in the CLI session (~/.higgsfield)
 *
 * CLI prerequisites:
 *   npm install -g @higgsfield/cli
 *   higgsfield auth login
 *   higgsfield workspace set <id>
 *
 * Currently implemented:
 *   text-to-image — higgsfield generate create <model> --prompt "…" --aspect_ratio --wait
 *
 * Future-ready dispatch (throws InvalidRequestError until implemented):
 *   image-to-image, inpaint, outpaint, background-removal, variation, upscale
 *
 * Supported models (MODEL_IDS maps public name → CLI job_set_type):
 *   nano-banana-pro    → nano_banana_pro    (default)
 *   nano-banana-2      → nano_banana_flash
 *   nano-banana-2-lite → nano_banana_2_lite
 */

import { execFile } from "child_process";
import { promisify } from "util";
import type { AIProvider } from "../provider";
import type {
  GenerateRequest,
  GenerateResponse,
  ProviderCapability,
  ProviderConfig,
} from "../types";
import type { ImageOperationType } from "../types/image";
import {
  InvalidRequestError,
  ProviderUnavailableError,
  ContentFilterError,
  TimeoutError,
  AIError,
} from "../errors";
import { aiLogger } from "../logger";

const execFileAsync = promisify(execFile);

// ── Model registry ────────────────────────────────────────────────────────────

const MODEL_IDS: Readonly<Record<string, string>> = {
  "nano-banana-pro":    "nano_banana_pro",
  "nano-banana-2":      "nano_banana_flash",
  "nano-banana-2-lite": "nano_banana_2_lite",
};

// ── Prompt enrichment ─────────────────────────────────────────────────────────

const STYLE_MODIFIERS: Readonly<Record<string, string>> = {
  "realistic":    "photorealistic, high-quality photography, natural lighting, 4K, professional",
  "illustration": "digital illustration, vibrant colors, clean lines, artistic",
  "flat-design":  "flat design, minimal, geometric shapes, solid colors, modern UI aesthetic",
  "3d-render":    "3D CGI render, physically based rendering, studio lighting, high detail",
  "watercolor":   "watercolor painting, soft washes, artistic, hand-painted texture",
  "pixel-art":    "pixel art, retro game aesthetic, crisp pixels, 8-bit style",
  "cinematic":    "cinematic photography, film grain, dramatic lighting, anamorphic lens",
  "editorial":    "editorial photography, magazine quality, professional composition",
};

const QUALITY_MODIFIERS: Readonly<Record<string, string>> = {
  "draft":    "rough draft quality, sketch-like",
  "standard": "high quality, professional, detailed",
  "hd":       "ultra-high definition, extremely detailed, crisp, sharp",
  "ultra-hd": "maximum quality, 8K, photorealistic detail, perfect composition, masterpiece",
};

const ASPECT_RATIO_PASS_THROUGH = new Set([
  "1:1", "16:9", "9:16", "4:3", "3:2",
]);

// ── Internal types ────────────────────────────────────────────────────────────

interface ImageGenerationMeta {
  operationType?:     ImageOperationType;
  aspectRatio?:       string;
  quality?:           string;
  style?:             string;
  referenceImages?:   string[];
  /**
   * Absolute filesystem path to an official brand logo PNG.
   * When set, the file is passed to the CLI as --image <path> so the model
   * uses it as a reference asset. Set by the brand policy layer in the
   * API route — never by callers directly.
   */
  logoReferencePath?: string;
}

interface GenerationResult {
  imageDataUrl: string;
  model: string;
}

interface ExecError extends Error {
  code?:   string | number;
  killed?: boolean;
  stdout?: string;
  stderr?: string;
  signal?: string | null;
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class HiggsFieldProvider implements AIProvider {
  readonly name = "higgsfield";
  readonly capabilities: ProviderCapability[] = ["image-generation"];

  private readonly defaultModel: string;
  private readonly timeoutMs: number;

  constructor(config: ProviderConfig) {
    this.defaultModel = config.model;
    this.timeoutMs    = config.timeoutMs;
  }

  // ── Public: AIProvider interface ────────────────────────────────────────────

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const modelKey     = request.model ?? this.defaultModel;
    const meta         = (request.meta ?? {}) as ImageGenerationMeta;
    const operationType: ImageOperationType = meta.operationType ?? "text-to-image";
    const start        = Date.now();

    try {
      let result: GenerationResult;

      switch (operationType) {
        case "text-to-image":
          result = await this._textToImage(request, modelKey, meta);
          break;

        case "image-to-image":
          throw new InvalidRequestError(
            "image-to-image is not yet implemented for HiggsFieldProvider.",
            this.name,
          );
        case "inpaint":
          throw new InvalidRequestError("inpaint is not yet implemented.", this.name);
        case "outpaint":
          throw new InvalidRequestError("outpaint is not yet implemented.", this.name);
        case "background-removal":
          throw new InvalidRequestError("background-removal is not yet implemented.", this.name);
        case "variation":
          throw new InvalidRequestError("variation is not yet implemented.", this.name);
        case "upscale":
          throw new InvalidRequestError("upscale is not yet implemented.", this.name);

        default: {
          const exhaustive: never = operationType;
          throw new InvalidRequestError(
            `Unknown operationType: "${exhaustive}".`,
            this.name,
          );
        }
      }

      aiLogger.info("Image generation complete", {
        provider: this.name,
        durationMs: Date.now() - start,
        meta: { model: result.model, operationType },
      });

      return {
        text:         "",
        imageDataUrl: result.imageDataUrl,
        model:        result.model,
        provider:     this.name,
      };
    } catch (err) {
      aiLogger.error("Image generation failed", {
        provider: this.name,
        durationMs: Date.now() - start,
        meta: { model: modelKey, operationType, error: (err as Error).message },
      });
      if (err instanceof AIError) throw err;
      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await execFileAsync("higgsfield", ["--version"], { timeout: 3_000 });
      return true;
    } catch {
      return false;
    }
  }

  // ── Private: text-to-image ──────────────────────────────────────────────────

  private async _textToImage(
    request: GenerateRequest,
    modelKey: string,
    meta: ImageGenerationMeta,
  ): Promise<GenerationResult> {
    const basePrompt = this._extractPrompt(request);
    if (!basePrompt.trim()) {
      throw new InvalidRequestError(
        "A non-empty text prompt is required for image generation.",
        this.name,
      );
    }

    const cliModel       = MODEL_IDS[modelKey] ?? modelKey;
    const enrichedPrompt = this._enrichPrompt(basePrompt, meta);
    const args           = this._buildArgs(cliModel, enrichedPrompt, meta);

    const execTimeoutMs = Math.max(this.timeoutMs - 5_000, 30_000);

    let stdout: string;
    let stderr: string;

    try {
      const out = await execFileAsync("higgsfield", args, {
        timeout:   execTimeoutMs,
        maxBuffer: 8 * 1024 * 1024,
        env:       { ...process.env },
      });
      stdout = out.stdout.trim();
      stderr = out.stderr.trim();
    } catch (err) {
      this._handleCliError(err as ExecError);
    }

    aiLogger.info("Higgsfield CLI completed", {
      provider: this.name,
      meta: { cliModel, args: args.join(" "), stdoutLen: stdout!.length },
    });

    const cdnUrl       = this._extractUrl(stdout!);
    const imageDataUrl = await this._fetchAsDataUrl(cdnUrl);

    return { imageDataUrl, model: cliModel };
  }

  // ── Private: CLI args builder ───────────────────────────────────────────────

  private _buildArgs(
    cliModel: string,
    prompt: string,
    meta: ImageGenerationMeta,
  ): string[] {
    const waitTimeoutSec = Math.floor((Math.max(this.timeoutMs - 7_000, 25_000)) / 1_000);

    const args: string[] = [
      "generate", "create", cliModel,
      "--prompt", prompt,
      "--wait",
      "--wait-timeout", `${waitTimeoutSec}s`,
    ];

    if (meta.aspectRatio && ASPECT_RATIO_PASS_THROUGH.has(meta.aspectRatio)) {
      args.push("--aspect_ratio", meta.aspectRatio);
    }

    if (meta.logoReferencePath) {
      args.push("--image", meta.logoReferencePath);
    }

    return args;
  }

  // ── Private: CLI error classifier ──────────────────────────────────────────
  //
  // IMPORTANT: Every branch must throw — never return. The `never` return type
  // enforces this. Surface real stderr/message detail in every error so users
  // get actionable diagnostics instead of a generic "unavailable" message.

  private _handleCliError(err: ExecError): never {
    // Binary not found — Higgsfield CLI is not installed or not on PATH.
    if (err.code === "ENOENT") {
      throw new ProviderUnavailableError(
        this.name,
        "Higgsfield CLI not found. Install it with: npm install -g @higgsfield/cli, then run: higgsfield auth login",
      );
    }

    // Process killed by our timeout.
    if (err.killed || err.signal === "SIGTERM") {
      throw new TimeoutError(this.name, this.timeoutMs);
    }

    const rawStderr  = err.stderr ?? "";
    const rawStdout  = err.stdout ?? "";
    const combined   = (rawStderr + " " + rawStdout).toLowerCase();

    // Surface the real stderr for debugging (truncated to 400 chars).
    const detail = (rawStderr || err.message || "unknown error").slice(0, 400);

    if (
      combined.includes("no workspace selected") ||
      combined.includes("workspace")
    ) {
      throw new InvalidRequestError(
        "Higgsfield workspace not configured. Run: higgsfield workspace set <workspace_id>",
        this.name,
      );
    }

    if (
      combined.includes("session expired") ||
      combined.includes("not authenticated") ||
      combined.includes("unauthenticated") ||
      combined.includes("auth")
    ) {
      throw new InvalidRequestError(
        "Higgsfield session expired. Run: higgsfield auth login",
        this.name,
      );
    }

    if (
      combined.includes("content") ||
      combined.includes("safety") ||
      combined.includes("blocked") ||
      combined.includes("policy")
    ) {
      throw new ContentFilterError(this.name);
    }

    // Generic fallback — always include real stderr detail so callers can
    // surface it to users and engineers instead of a generic message.
    throw new ProviderUnavailableError(this.name, detail);
  }

  // ── Private: output parsing ─────────────────────────────────────────────────

  private _extractUrl(stdout: string): string {
    const lines = stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.startsWith("https://") || line.startsWith("http://")) {
        return line;
      }
    }

    throw new ProviderUnavailableError(
      this.name,
      `CLI produced no image URL in stdout. Full output: ${stdout.slice(0, 400)}`,
    );
  }

  // ── Private: CDN fetch → base64 data URL ───────────────────────────────────

  private async _fetchAsDataUrl(cdnUrl: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(cdnUrl, {
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      throw new ProviderUnavailableError(
        this.name,
        `Failed to fetch generated image from CDN (${cdnUrl}): ${(err as Error).message}`,
      );
    }

    if (!response.ok) {
      throw new ProviderUnavailableError(
        this.name,
        `CDN returned HTTP ${response.status} for image URL: ${cdnUrl}`,
      );
    }

    const mimeType = response.headers.get("content-type")?.split(";")[0]?.trim()
      ?? "image/png";
    const buffer   = await response.arrayBuffer();
    const base64   = Buffer.from(buffer).toString("base64");

    return `data:${mimeType};base64,${base64}`;
  }

  // ── Private: prompt helpers ─────────────────────────────────────────────────

  private _extractPrompt(request: GenerateRequest): string {
    const userMessages = request.messages.filter((m) => m.role === "user");
    const last = userMessages[userMessages.length - 1];
    if (!last) return "";
    if (typeof last.content === "string") return last.content;
    return last.content
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("\n");
  }

  private _enrichPrompt(basePrompt: string, meta: ImageGenerationMeta): string {
    const parts: string[] = [basePrompt];
    const styleMod   = meta.style   ? STYLE_MODIFIERS[meta.style]    : undefined;
    const qualityMod = meta.quality ? QUALITY_MODIFIERS[meta.quality] : undefined;
    if (styleMod)   parts.push(styleMod);
    if (qualityMod) parts.push(qualityMod);
    return parts.join(". ");
  }
}
