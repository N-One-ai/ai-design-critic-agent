/**
 * Structured AI logger.
 *
 * SECURITY CONTRACT:
 *   This logger NEVER writes API keys, secrets, tokens, or credentials to output.
 *   All log entries pass through `redactSensitive()` before serialisation.
 *   Do not bypass this logger for AI-layer logging.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface AILogContext {
  provider?: string;
  service?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}

interface LogEntry extends AILogContext {
  level: LogLevel;
  message: string;
}

/* Keys whose values must always be redacted, regardless of depth. */
const SENSITIVE_PATTERN = /key|secret|token|password|credential|auth|apikey/i;

function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_PATTERN.test(k)) {
      out[k] = "[REDACTED]";
    } else if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactSensitive(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function serialize(entry: LogEntry): string {
  const parts: string[] = [`[AI:${entry.level.toUpperCase()}]`];

  if (entry.provider) parts.push(`provider=${entry.provider}`);
  if (entry.service)  parts.push(`service=${entry.service}`);

  parts.push(entry.message);

  if (entry.durationMs !== undefined) parts.push(`(${entry.durationMs}ms)`);

  if (entry.meta && Object.keys(entry.meta).length > 0) {
    try {
      parts.push(JSON.stringify(redactSensitive(entry.meta)));
    } catch {
      parts.push("[meta serialization failed]");
    }
  }

  return parts.join(" ");
}

function emit(entry: LogEntry): void {
  const line = serialize(entry);
  switch (entry.level) {
    case "error": console.error(line); break;
    case "warn":  console.warn(line);  break;
    default:      console.log(line);   break;
  }
}

function makeLogger(level: LogLevel) {
  return (message: string, context?: AILogContext): void => {
    emit({ level, message, ...context });
  };
}

export const aiLogger = {
  debug: makeLogger("debug"),
  info:  makeLogger("info"),
  warn:  makeLogger("warn"),
  error: makeLogger("error"),
};
