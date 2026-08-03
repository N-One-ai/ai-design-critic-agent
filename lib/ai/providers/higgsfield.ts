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
 * CLI prerequisite:
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
 *   nano-banana-pro   → nano_banana_pro    (default)
 *   nano-banana-2     → nano_banana_flash
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
// Maps the public model name (used in config / API requests) to the CLI
// job_set_type that `higgsfield generate create` accepts.

const MODEL_IDS: Readonly<Record<string, string>> = {
  "nano-banana-pro":   "nano_banana_pro",
  "nano-banana-2":     "nano_banana_flash",
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

// Higgsfield accepts the same ratio strings that the API surface exposes.
const ASPECT_RATIO_PASS_THROUGH = new Set([
  "1:1", "16:9", "9:16", "4:3", "3:2",
]);

// ── Internal types ────────────────────────────────────────────────────────────

interface ImageGenerationMeta {
  operationType?:      ImageOperationType;
  aspectRatio?:        string;
  quality?:            string;
  style?:              string;
  referenceImages?:    string[];
  /**
   * Absolute filesystem path to an official brand logo PNG.
   * When set, the file is passed to the CLI as --image <path> so the model
   * uses it as a reference asset. Set by the brand policy layer in the
   * API route — never by callers directly.
   */
  logoReferencePath?:  string;
}

interface GenerationResult {
  imageDataUrl: string;
  model: string;
}

// Error shape emitted by Node's execFile when the child process fails.
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

    // Wall-clock budget: leave 5 s for post-processing (fetch + base64 encode).
    const execTimeoutMs = Math.max(this.timeoutMs - 5_000, 30_000);

    let stdout: string;
    let stderr: string;

    try {
      const out = await execFileAsync("higgsfield", args, {
        timeout:   execTimeoutMs,
        maxBuffer: 8 * 1024 * 1024, // 8 MB — more than enough for a URL
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

    const cdnUrl      = this._extractUrl(stdout!);
    const imageDataUrl = await this._fetchAsDataUrl(cdnUrl);

    return { imageDataUrl, model: cliModel };
  }

  // ── Private: CLI args builder ───────────────────────────────────────────────

  private _buildArgs(
    cliModel: string,
    prompt: string,
    meta: ImageGenerationMeta,
  ): string[] {
    // Timeout for the --wait flag: always 2 s shorter than our execFile budget.
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

    // Brand logo reference: Nano Banana Pro (and other Higgsfield models that
    // expose image_references) accept --image <path> as a style reference.
    // The brand policy layer sets logoReferencePath when a Zalopay (or other
    // brand) prompt is detected and this provider supports reference images.
    if (meta.logoReferencePath) {
      args.push("--image", meta.logoReferencePath);
    }

    return args;
  }

  // ── Private: CLI error classifier ──────────────────────────────────────────

  private _handleCliError(err: ExecError): never {
    // Binary not found — Higgsfield CLI is not installed.
    if (err.code === "ENOENT") {
      throw new ProviderUnavailableError(this.name);
    }

    // Process was killed by our timeout.
    if (err.killed || err.signal === "SIGTERM") {
      throw new TimeoutError(this.name, this.timeoutMs);
    }

    const stderr = (err.stderr ?? "").toLowerCase();
    const stdout = (err.stdout ?? "").toLowerCase();
    const combined = stderr + " " + stdout;

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

    // Generic fallback — surface the stderr to aid debugging.
    const detail = (err.stderr ?? err.message ?? "unknown error").slice(0, 300);
    throw new ProviderUnavailableError(this.name);
    // TS unreachable, but keeps the method return type: never.
    throw new Error(detail);
  }

  // ── Private: output parsing ─────────────────────────────────────────────────

  private _extractUrl(stdout: string): string {
    // The CLI prints the CDN URL as the last line of stdout when using --wait.
    // Guard against any trailing whitespace or spinner residue.
    const lines = stdout
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Walk backwards and take the first line that looks like a URL.
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.startsWith("https://") || line.startsWith("http://")) {
        return line;
      }
    }

    throw new Error(
      `Higgsfield CLI produced no image URL. stdout: ${stdout.slice(0, 300)}`,
    );
  }

  // ── Private: CDN fetch → base64 data URL ───────────────────────────────────
  // Converts the remote CDN URL to a base64 data URL so the API route's
  // Supabase upload path and response serialization work unchanged.

  private async _fetchAsDataUrl(cdnUrl: string): Promise<string> {
    let response: Response;
    try {
      response = await fetch(cdnUrl, {
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      throw new Error(
        `Failed to retrieve generated image from Higgsfield CDN (${cdnUrl}): ${(err as Error).message}`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `Higgsfield CDN returned ${response.status} for image URL: ${cdnUrl}`,
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
    const styleMod   = meta.style   ? STYLE_MODIFIERS[meta.style]     : undefined;
    const qualityMod = meta.quality ? QUALITY_MODIFIERS[meta.quality]  : undefined;
    if (styleMod)   parts.push(styleMod);
    if (qualityMod) parts.push(qualityMod);
    return parts.join(". ");
  }
}
