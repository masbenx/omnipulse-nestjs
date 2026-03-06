"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — Node.js HTTP Transport
// Batching with GZIP compression (server-side)
// ─────────────────────────────────────────────
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transport = void 0;
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const zlib = __importStar(require("zlib"));
const url_1 = require("url");
const SDK_VERSION = '0.1.1';
const USER_AGENT = `omnipulse-nestjs-sdk/v${SDK_VERSION}`;
class Transport {
    constructor(config) {
        this.logQueue = [];
        this.errorQueue = [];
        this.spanQueue = [];
        this.requestQueue = [];
        this.flushInterval = null;
        this.config = config;
        this.batchSize = config.batchSize ?? 50;
        this.flushMs = config.flushIntervalMs ?? 5000;
        this.startBatching();
    }
    // ─── Queue API ───────────────────────────
    addLog(entry) {
        this.logQueue.push(entry);
        if (this.logQueue.length >= this.batchSize) {
            this.flushLogs();
        }
    }
    addError(entry) {
        this.errorQueue.push(entry);
        if (this.errorQueue.length >= this.batchSize) {
            this.flushErrors();
        }
    }
    addSpan(span) {
        this.spanQueue.push(span);
        if (this.spanQueue.length >= this.batchSize) {
            this.flushTraces();
        }
    }
    addRequest(entry) {
        this.requestQueue.push(entry);
        if (this.requestQueue.length >= this.batchSize) {
            this.flushRequests();
        }
    }
    // ─── Flush Methods ───────────────────────
    flushLogs() {
        if (this.logQueue.length === 0)
            return;
        const batch = this.logQueue.splice(0);
        this.send('/api/ingest/app-logs', { entries: batch });
    }
    flushErrors() {
        if (this.errorQueue.length === 0)
            return;
        const batch = this.errorQueue.splice(0);
        for (const error of batch) {
            this.send('/api/ingest/app-errors', error);
        }
    }
    flushTraces() {
        if (this.spanQueue.length === 0)
            return;
        const batch = this.spanQueue.splice(0);
        this.send('/api/ingest/app-traces', { spans: batch });
    }
    flushRequests() {
        if (this.requestQueue.length === 0)
            return;
        const batch = this.requestQueue.splice(0);
        for (const req of batch) {
            this.send('/api/ingest/app-request', req);
        }
    }
    flushAll() {
        this.flushLogs();
        this.flushErrors();
        this.flushTraces();
        this.flushRequests();
    }
    // ─── Test Connection ─────────────────────
    testConnection() {
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
                const url = new url_1.URL('/api/ingest/app-logs', endpoint);
                const isHttps = url.protocol === 'https:';
                const client = isHttps ? https : http;
                const options = {
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
                        }
                        else {
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
            }
            catch {
                resolve({ success: false });
            }
        });
    }
    // ─── Internal ────────────────────────────
    startBatching() {
        if (this.flushInterval)
            clearInterval(this.flushInterval);
        this.flushInterval = setInterval(() => {
            this.flushAll();
        }, this.flushMs);
    }
    send(path, payload) {
        const data = JSON.stringify(payload);
        zlib.gzip(data, (err, buffer) => {
            if (err) {
                if (this.config.debug) {
                    console.error('[OmniPulse] GZIP failed:', err);
                }
                return;
            }
            const endpoint = this.config.endpoint || 'https://api.omnipulse.cloud';
            const url = new url_1.URL(path, endpoint);
            const isHttps = url.protocol === 'https:';
            const client = isHttps ? https : http;
            const options = {
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
    stop() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
        this.flushAll();
    }
}
exports.Transport = Transport;
//# sourceMappingURL=transport.js.map