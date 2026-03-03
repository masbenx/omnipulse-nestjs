// ─────────────────────────────────────────────
// @omnipulse/nestjs — Injectable Logger
// Structured logging to OmniPulse backend
// ─────────────────────────────────────────────

import { Transport } from './transport';
import { LogEntry } from './types';
import * as os from 'os';

export class OmniPulseLogger {
    private transport: Transport;
    private serviceName: string;
    private hostname: string;

    constructor(transport: Transport, serviceName?: string) {
        this.transport = transport;
        this.serviceName = serviceName || 'nestjs-app';
        this.hostname = os.hostname();
    }

    private log(
        level: LogEntry['level'],
        message: string,
        meta?: Record<string, any>,
        traceId?: string,
        requestId?: string,
    ): void {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            host: this.hostname,
            meta,
            trace_id: traceId,
            request_id: requestId,
        };

        this.transport.addLog(entry);
    }

    public info(message: string, meta?: Record<string, any>): void {
        this.log('info', message, meta);
    }

    public warn(message: string, meta?: Record<string, any>): void {
        this.log('warn', message, meta);
    }

    public error(message: string, meta?: Record<string, any>): void {
        this.log('error', message, meta);
    }

    public debug(message: string, meta?: Record<string, any>): void {
        this.log('debug', message, meta);
    }

    /**
     * Log with trace context (for use inside request handlers).
     */
    public logWithContext(
        level: LogEntry['level'],
        message: string,
        traceId: string,
        requestId?: string,
        meta?: Record<string, any>,
    ): void {
        this.log(level, message, meta, traceId, requestId);
    }
}
