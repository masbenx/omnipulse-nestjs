import { OmniPulseConfig, LogEntry, ErrorEntry, SpanEntry } from './types';
export declare class Transport {
    private config;
    private logQueue;
    private errorQueue;
    private spanQueue;
    private flushInterval;
    private readonly batchSize;
    private readonly flushMs;
    constructor(config: OmniPulseConfig);
    addLog(entry: LogEntry): void;
    addError(entry: ErrorEntry): void;
    addSpan(span: SpanEntry): void;
    flushLogs(): void;
    flushErrors(): void;
    flushTraces(): void;
    flushAll(): void;
    testConnection(): Promise<{ success: boolean; httpCode?: number; response?: any; }>;
    private startBatching;
    private send;
    stop(): void;
}
