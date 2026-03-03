// ─────────────────────────────────────────────
// @omnipulse/nestjs — Trace Context Middleware
// Generates and attaches trace_id + request_id
// ─────────────────────────────────────────────

import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Middleware that attaches a unique trace_id and request_id
 * to each incoming HTTP request for distributed tracing.
 *
 * Applied automatically when using OmniPulseModule.forRoot().
 * The trace_id is also set as a response header for client correlation.
 */
@Injectable()
export class OmniPulseMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void {
        try {
            // Use incoming trace ID if provided, otherwise generate one
            const traceId = req.headers?.['x-trace-id'] || randomUUID();
            const requestId = randomUUID();

            // Attach to request for downstream use
            req.__omnipulse_trace_id = traceId;
            req.__omnipulse_request_id = requestId;

            // Set response header for client-side correlation
            if (typeof res.setHeader === 'function') {
                res.setHeader('x-trace-id', traceId);
                res.setHeader('x-request-id', requestId);
            }
        } catch {
            // Silent — SDK must never crash
        }

        next();
    }
}
