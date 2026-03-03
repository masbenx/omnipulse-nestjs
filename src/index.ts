// ─────────────────────────────────────────────
// @omnipulse/nestjs — Public API
// ─────────────────────────────────────────────

// Module
export { OmniPulseModule } from './omnipulse.module';

// Service
export { OmniPulseService } from './omnipulse.service';

// Logger
export { OmniPulseLogger } from './omnipulse.logger';

// Interceptor & Filter (for manual registration if needed)
export { OmniPulseInterceptor } from './omnipulse.interceptor';
export { OmniPulseExceptionFilter } from './omnipulse.filter';
export { OmniPulseMiddleware } from './omnipulse.middleware';

// Transport (for advanced usage)
export { Transport } from './transport';

// Types
export type {
    OmniPulseConfig,
    LogEntry,
    ErrorEntry,
    SpanEntry,
    TestResult,
} from './types';
export { OMNIPULSE_CONFIG } from './types';
