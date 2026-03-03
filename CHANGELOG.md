## [v0.1.1] - 2026-03-03
### Changed
- Automated release via script.

# Changelog

## [v0.1.0] - 2026-03-03

### Added
- Initial release of `@omnipulse/nestjs` SDK
- `OmniPulseModule.forRoot()` — NestJS dynamic module for initialization
- `OmniPulseService` — Injectable singleton client
- `OmniPulseLogger` — Injectable structured logger (info/warn/error/debug)
- `OmniPulseInterceptor` — Automatic HTTP request tracing (duration, status, route)
- `OmniPulseExceptionFilter` — Automatic unhandled exception capture
- `OmniPulseMiddleware` — Request-scoped trace context (trace_id, request_id)
- Node.js HTTP transport with GZIP compression and batching
