import { Transport } from './transport';
import { LogEntry } from './types';
export declare class OmniPulseLogger {
    private transport;
    private serviceName;
    private hostname;
    constructor(transport: Transport, serviceName?: string);
    private log;
    info(message: string, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    error(message: string, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    /**
     * Log with trace context (for use inside request handlers).
     */
    logWithContext(level: LogEntry['level'], message: string, traceId: string, requestId?: string, meta?: Record<string, any>): void;
}
//# sourceMappingURL=omnipulse.logger.d.ts.map