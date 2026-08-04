/**
 * AIProviderRegistry
 *
 * Central registry mapping provider names to live provider instances.
 * Providers are registered at application startup (e.g. in a Next.js
 * instrumentation.ts or a lazy-init singleton).
 *
 * Design principles:
 *   - Services never import concrete providers; they call `registry.getCapable()`
 *   - The registry is the only place that knows which providers are active
 *   - Swapping or adding a provider requires only a new register() call
 *
 * Usage:
 *   import { AIProviderRegistry } from "@/lib/ai/registry";
 *   import { GeminiProvider }     from "@/lib/ai/provider/gemini";
 *   import { aiProviderConfig }   from "@/lib/config";
 *
 *   AIProviderRegistry.register(new GeminiProvider(aiProviderConfig.gemini));
 *   AIProviderRegistry.setDefault("gemini");
 *
 *   // In a service:
 *   const provider = AIProviderRegistry.getCapable("image-analysis");
 */

import type { AIProvider } from "./provider";
import type { ProviderCapability } from "./types";
import { aiLogger } from "./logger";

export class AIProviderRegistry {
  private static readonly _providers = new Map<string, AIProvider>();
  private static _defaultName = "gemini";

  /** Register a provider instance. Overwrites any existing registration for the same name. */
  static register(provider: AIProvider): void {
    this._providers.set(provider.name, provider);
    aiLogger.info(`Provider registered`, {
      provider: provider.name,
      meta: { capabilities: provider.capabilities },
    });
  }

  /** Set which registered provider is used when no specific provider is requested. */
  static setDefault(name: string): void {
    if (!this._providers.has(name)) {
      throw new Error(
        `Cannot set default provider to "${name}" — it is not registered. ` +
        `Registered: ${this.registeredNames().join(", ") || "none"}`,
      );
    }
    this._defaultName = name;
  }

  /** Retrieve a provider by name. Throws if not registered. */
  static get(name: string): AIProvider {
    const provider = this._providers.get(name);
    if (!provider) {
      throw new Error(
        `Provider "${name}" is not registered. ` +
        `Registered: ${this.registeredNames().join(", ") || "none"}`,
      );
    }
    return provider;
  }

  /** Return the default provider. */
  static getDefault(): AIProvider {
    return this.get(this._defaultName);
  }

  /**
   * Return the best provider for a given capability.
   * Preference order: default provider → first registered provider that qualifies.
   * Throws if no registered provider supports the capability.
   */
  static getCapable(capability: ProviderCapability): AIProvider {
    const def = this._providers.get(this._defaultName);
    if (def?.capabilities.includes(capability)) return def;

    for (const provider of this._providers.values()) {
      if (provider.capabilities.includes(capability)) return provider;
    }

    throw new Error(
      `No registered provider supports capability "${capability}". ` +
      `Registered: ${this.registeredNames().join(", ") || "none"}`,
    );
  }

  /** List all registered provider instances. */
  static listAll(): AIProvider[] {
    return [...this._providers.values()];
  }

  /** List all registered provider names. */
  static registeredNames(): string[] {
    return [...this._providers.keys()];
  }

  /** Remove all registrations. Useful in tests and hot-reload scenarios. */
  static clear(): void {
    this._providers.clear();
  }
}
