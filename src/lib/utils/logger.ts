/**
 * Centralized Logger Utility
 *
 * A simple, extensible logger for consistent logging across the application.
 * In development, logs to console. In production, could be extended to send
 * to external services like Sentry, LogRocket, etc.
 *
 * @example
 * ```ts
 * import { logger } from "@/utils/logger";
 *
 * logger.error("Failed to load data:", error);
 * logger.warn("Deprecated API usage");
 * logger.info("User logged in");
 * logger.debug("Component rendered");
 * ```
 */

type LogLevel = "error" | "warn" | "info" | "debug";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

// Configuration - can be extended to read from environment
const config = {
  // In production, you might want to disable debug logs
  enabledLevels: ["error", "warn", "info", "debug"] as LogLevel[],
  // Can be extended to send to external services
  enableConsole: true,
};

/**
 * Format a log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const timestamp = entry.timestamp.toISOString();
  return `[${timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
}

/**
 * Output a log entry to the appropriate destination
 */
function output(entry: LogEntry): void {
  if (!config.enabledLevels.includes(entry.level)) {
    return;
  }

  if (config.enableConsole) {
    const formatted = formatLogEntry(entry);

    switch (entry.level) {
      case "error":
        if (entry.data) {
          console.error(formatted, entry.data);
        } else {
          console.error(formatted);
        }
        break;
      case "warn":
        if (entry.data) {
          console.warn(formatted, entry.data);
        } else {
          console.warn(formatted);
        }
        break;
      case "info":
        if (entry.data) {
          console.info(formatted, entry.data);
        } else {
          console.info(formatted);
        }
        break;
      case "debug":
        if (entry.data) {
          console.debug(formatted, entry.data);
        } else {
          console.debug(formatted);
        }
        break;
    }
  }

  // Future: Send to external service like Sentry
  // if (entry.level === 'error') {
  //   Sentry.captureException(entry.data);
  // }
}

/**
 * Create a log entry and output it
 */
function log(level: LogLevel, message: string, data?: unknown): void {
  const entry: LogEntry = {
    level,
    message,
    data,
    timestamp: new Date(),
  };
  output(entry);
}

/**
 * Logger object with methods for each log level
 */
export const logger = {
  /**
   * Log an error. Use for exceptions and critical failures.
   * @example logger.error("Failed to save:", error);
   */
  error: (message: string, data?: unknown) => log("error", message, data),

  /**
   * Log a warning. Use for deprecated APIs, performance issues, etc.
   * @example logger.warn("API is deprecated, use v2 instead");
   */
  warn: (message: string, data?: unknown) => log("warn", message, data),

  /**
   * Log info. Use for significant application events.
   * @example logger.info("User logged in successfully");
   */
  info: (message: string, data?: unknown) => log("info", message, data),

  /**
   * Log debug info. Use for development debugging only.
   * @example logger.debug("Component props:", props);
   */
  debug: (message: string, data?: unknown) => log("debug", message, data),
};

export default logger;
