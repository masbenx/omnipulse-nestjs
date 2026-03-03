// ─────────────────────────────────────────────
// @omnipulse/nestjs — Node.js HTTP Transport
// Batching with GZIP compression (server-side)
// ─────────────────────────────────────────────

import * as http from 'http';
import * as https from 'https';
import * as zlib from 'zlib';
import { URL } from 'url';
import { OmniPulseConfig, LogEntry, ErrorEntry, SpanEntry } from './types';

const SDK_VERSION = '0.1.0';
const USER_AGENT = `omnipulse-nestjs-sdk/v${SDK_VERSION}`;

export class Transport {
    private config: OmniPulseConfig;
    private logQueue: LogEntry[] = [];
    private errorQueue: ErrorEntry[] = [];
    private spanQueue: SpanEntry[] = [];
    private flushInterval: ReturnType<typeof setInterval> | null = null;
    private readonly batchSize: number;
    private readonly flushMs: number;

    constructor(config: OmniPulseConfig) {
        this.config = config;
        this.batchSize = config.batchSize ?? 50;
        this.flushMs = config.flushIntervalMs ?? 5000;
        this.startBatching();
    }

    // ─── Queue API ───────────────────────────

    public addLog(entry: LogEntry): void {
        this.logQueue.push(entry);
        if (this.logQueue.length >= this.batchSize) {
            this.flushLogs();
        }
    }

    public addError(entry: ErrorEntry): void {
        this.errorQueue.push(entry);
        if (this.errorQueue.length >= this.batchSize) {
            this.flushErrors();
        }
    }

    public addSpan(span: SpanEntry): void {
        this.spanQueue.push(span);
        if (this.spanQueue.length >= this.batchSize) {
            this.flushTraces();
        }
    }

    // ─── Flush Methods ───────────────────────

    public flushLogs(): void {
        if (this.logQueue.length === 0) return;
        const batch = this.logQueue.splice(0);
        this.send('/api/ingest/app-logs', { entries: batch });
    }

    public flushErrors(): void {
        if (this.errorQueue.length === 0) return;
        const batch = this.errorQueue.splice(0);
        this.send('/api/ingest/app-errors', { entries: batch });
    }

    public flushTraces(): void {
        if (this.spanQueue.length === 0) return;
        const batch = this.spanQueue.splice(0);
        this.send('/api/ingest/app-traces', { spans: batch });
    }

    public flushAll(): void {
        this.flushLogs();
        this.flushErrors();
        this.flushTraces();
    }

    // ─── Test Connection ─────────────────────

    public testConnection(): Promise<{ success: boolean; httpCode?: number; response?: any }> {
        const payload = JSON.stringify({
            entries: [{
                level: 'info',
                message: 'OmniPulse NestJS SDK test connection successful',
                timestamp: new Date().toISOString(),
                service: this.config.serviceName || 'nestjs-app',
                meta: {
                    sdk: 'nestjs',
                    test: 'true',
                    node_version: process.version,
                },
            }],
        });

        return new Promise((resolve) => {
            try {
                const endpoint = this.config.endpoint || 'https://api.omnipulse.cloud';
                const url = new URL('/api/ingest/app-logs', endpoint);
                const isHttps = url.protocol === 'https:';
                const client = isHttps ? https : http;

                const options: http.RequestOptions = {
                    method: 'POST',
                    hostname: url.hostname,
                    port: url.port || (isHttps ? 443 : 80),
                    path: url.pathname,
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(payload),
                        'X-Ingest-Key': this.config.apiKey,
                        'User-Agent': USER_AGENT,
                    },
                    timeout: 10000,
                };

                const req = client.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => (data += chunk));
                    res.on('end', () => {
                        const statusCode = res.statusCode || 0;
                        if (statusCode >= 200 && statusCode < 300) {
                            resolve({
                                success: true,
                                httpCode: statusCode,
                                response: data ? JSON.parse(data) : null,
                            });
                        } else {
                            resolve({
                                success: false,
                                httpCode: statusCode,
                                response: data ? JSON.parse(data) : null,
                            });
                        }
                    });
                });

                req.on('error', () => resolve({ success: false }));
                req.on('timeout', () => {
                    req.destroy();
                    resolve({ success: false });
                });

                req.write(payload);
                req.end();
            } catch {
                resolve({ success: false });
            }
        });
    }

    // ─── Internal ────────────────────────────

    private startBatching(): void {
        if (this.flushInterval) clearInterval(this.flushInterval);
        this.flushInterval = setInterval(() => {
            this.flushAll();
        }, this.flushMs);
    }

    private send(path: string, payload: Record<string, any>): void {
        const data = JSON.stringify(payload);

        zlib.gzip(data, (err, buffer) => {
            if (err) {
                if (this.config.debug) {
                    console.error('[OmniPulse] GZIP failed:', err);
                }
                return;
            }

            const endpoint = this.config.endpoint || 'https://api.omnipulse.cloud';
            const url = new URL(path, endpoint);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;

            const options: http.RequestOptions = {
                method: 'POST',
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname + url.search,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Encoding': 'gzip',
                    'Content-Length': buffer.length,
                    'X-Ingest-Key': this.config.apiKey,
                    'User-Agent': USER_AGENT,
                },
                timeout: 2000,
            };

            const req = client.request(options, (res) => {
                res.resume(); // Consume response
            });

            req.on('error', (e) => {
                if (this.config.debug) {
                    console.error('[OmniPulse] Transport send failed:', e.message);
                }
            });

            req.on('timeout', () => req.destroy());
            req.write(buffer);
            req.end();
        });
    }

    public stop(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        this.flushAll();
    }
}
