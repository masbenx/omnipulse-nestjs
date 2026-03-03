export interface OmniPulseConfig {
    apiKey: string;
    serviceName?: string;
    environment?: string;
    endpoint?: string;
    debug?: boolean;
    flushIntervalMs?: number;
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
    start_time: string;
    end_time: string;
    duration_ms: number;
    status_code: 'ok' | 'error';
    status_message?: string;
    attributes?: Record<string, any>;
}
export interface TestResult {
    success: boolean;
    message: string;
    httpCode?: number;
    response?: any;
}
export declare const OMNIPULSE_CONFIG = "OMNIPULSE_CONFIG";
