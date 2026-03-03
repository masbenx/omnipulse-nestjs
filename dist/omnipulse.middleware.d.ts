import { NestMiddleware } from '@nestjs/common';
/**
 * Middleware that attaches a unique trace_id and request_id
 * to each incoming HTTP request for distributed tracing.
 *
 * Applied automatically when using OmniPulseModule.forRoot().
 * The trace_id is also set as a response header for client correlation.
 */
export declare class OmniPulseMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void;
}
//# sourceMappingURL=omnipulse.middleware.d.ts.map