"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — Injectable Logger
// Structured logging to OmniPulse backend
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
exports.OmniPulseLogger = void 0;
const os = __importStar(require("os"));
class OmniPulseLogger {
    constructor(transport, serviceName) {
        this.transport = transport;
        this.serviceName = serviceName || 'nestjs-app';
        this.hostname = os.hostname();
    }
    log(level, message, meta, traceId, requestId) {
        const entry = {
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
    info(message, meta) {
        this.log('info', message, meta);
    }
    warn(message, meta) {
        this.log('warn', message, meta);
    }
    error(message, meta) {
        this.log('error', message, meta);
    }
    debug(message, meta) {
        this.log('debug', message, meta);
    }
    /**
     * Log with trace context (for use inside request handlers).
     */
    logWithContext(level, message, traceId, requestId, meta) {
        this.log(level, message, meta, traceId, requestId);
    }
}
exports.OmniPulseLogger = OmniPulseLogger;
//# sourceMappingURL=omnipulse.logger.js.map