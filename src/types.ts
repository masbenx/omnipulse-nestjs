// ─────────────────────────────────────────────
// @omnipulse/nestjs — Shared Types
// Cross-SDK consistent with Node & React SDKs
// ─────────────────────────────────────────────

export interface OmniPulseConfig {
    /**
     * The Ingest Key for the project/app.
     * Required for authentication.
     */
    apiKey: string;

    /**
     * The Service Name to identify this application.
     * Defaults to "nestjs-app".
     */
    serviceName?: string;

    /**
     * The environment (e.g., 'production', 'staging').
     * Defaults to 'production'.
     */
    environment?: string;

    /**
     * The endpoint URL of the OmniPulse backend.
     * Defaults to "https://api.omnipulse.cloud".
     */
    endpoint?: string;

    /**
     * Enable console debugging of the SDK itself.
     */
    debug?: boolean;

    /**
     * Flush interval in milliseconds for batched data.
     * Defaults to 5000 (5 seconds).
     */
    flushIntervalMs?: number;

    /**
     * Maximum batch size before auto-flush.
     * Defaults to 50.
     */
    batchSize?: number;
}

export interface LogEntry {
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    timestamp: string;
    service?: string;
    host?: string;
    meta?: Record<string, any>;
    trace_id?: string;
    request_id?: string;
}

export interface ErrorEntry {
    type: string;
    message: string;
    stack?: string;
    url?: string;
    method?: string;
    status_code?: number;
    timestamp: string;
    service?: string;
    meta?: Record<string, any>;
    trace_id?: string;
    request_id?: string;
}

export interface SpanEntry {
    trace_id: string;
    span_id: string;
    name: string;
    start_ts: string;
    duration_ms: number;
    status: 'ok' | 'error';
    service?: string;
    kind?: string;
    attributes?: Record<string, any>;
    env?: string;
    release?: string;
}

export interface RequestEntry {
    timestamp: string;
    method: string;
    route: string;
    status: number;
    duration_ms: number;
    env?: string;
    release?: string;
    trace_id?: string;
    request_id?: string;
}

export interface TestResult {
    success: boolean;
    message: string;
    httpCode?: number;
    response?: any;
}

export const OMNIPULSE_CONFIG = 'OMNIPULSE_CONFIG';
