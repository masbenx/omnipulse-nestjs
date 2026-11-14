import { OmniPulseConfig, LogEntry, ErrorEntry, SpanEntry, RequestEntry, JobEntry, AppMetricEntry, AppOutgoingEntry, AppQueryEntry, AppCacheEntry } from './types';
export declare class Transport {
    private config;
    private logQueue;
    private errorQueue;
    private spanQueue;
    private requestQueue;
    private jobQueue;
    private metricQueue;
    private outgoingQueue;
    private queryQueue;
    private cacheQueue;
    private flushInterval;
    private readonly batchSize;
    private readonly flushMs;
    constructor(config: OmniPulseConfig);
    addLog(entry: LogEntry): void;
    addError(entry: ErrorEntry): void;
    addSpan(span: SpanEntry): void;
    addRequest(entry: RequestEntry): void;
    addJob(job: JobEntry): void;
    addMetric(metric: AppMetricEntry): void;
    addOutgoing(entry: AppOutgoingEntry): void;
    addQuery(entry: AppQueryEntry): void;
    addCache(entry: AppCacheEntry): void;
    flushLogs(): void;
    flushErrors(): void;
    flushTraces(): void;
    flushRequests(): void;
    flushJobs(): void;
    flushMetrics(): void;
    flushOutgoing(): void;
    flushQueries(): void;
    flushCaches(): void;
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