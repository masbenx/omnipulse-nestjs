"use strict";
// ─────────────────────────────────────────────
// @omnipulse/nestjs — Trace Context Middleware
// Generates and attaches trace_id + request_id
// ─────────────────────────────────────────────
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmniPulseMiddleware = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
/**
 * Middleware that attaches a unique trace_id and request_id
 * to each incoming HTTP request for distributed tracing.
 *
 * Applied automatically when using OmniPulseModule.forRoot().
 * The trace_id is also set as a response header for client correlation.
 */
let OmniPulseMiddleware = class OmniPulseMiddleware {
    use(req, res, next) {
        try {
            // Use incoming trace ID if provided, otherwise generate one
            const traceId = req.headers?.['x-trace-id'] || (0, crypto_1.randomUUID)();
            const requestId = (0, crypto_1.randomUUID)();
            // Attach to request for downstream use
            req.__omnipulse_trace_id = traceId;
            req.__omnipulse_request_id = requestId;
            // Set response header for client-side correlation
            if (typeof res.setHeader === 'function') {
                res.setHeader('x-trace-id', traceId);
                res.setHeader('x-request-id', requestId);
            }
        }
        catch {
            // Silent — SDK must never crash
        }
        next();
    }
};
exports.OmniPulseMiddleware = OmniPulseMiddleware;
exports.OmniPulseMiddleware = OmniPulseMiddleware = __decorate([
    (0, common_1.Injectable)()
], OmniPulseMiddleware);
//# sourceMappingURL=omnipulse.middleware.js.map