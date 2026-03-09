import { OmniPulseConfig, LogEntry, ErrorEntry, SpanEntry, RequestEntry } from './types';
export declare class Transport {
    private config;
    private logQueue;
    private errorQueue;
    private spanQueue;
    private requestQueue;
    private flushInterval;
    private readonly batchSize;
    private readonly flushMs;
    constructor(config: OmniPulseConfig);
    addLog(entry: LogEntry): void;
    addError(entry: ErrorEntry): void;
    addSpan(span: SpanEntry): void;
    addRequest(entry: RequestEntry): void;
    flushLogs(): void;
    flushErrors(): void;
    flushTraces(): void;
    flushRequests(): void;
    flushAll(): void;
    testConnection(): Promise<{
        success: boolean;
        httpCode?: number;
        response?: any;
    }>;
    private startBatching;
    private send;
    stop(): void;
}
//# sourceMappingURL=transport.d.ts.map