## [v0.1.2] - 2026-03-09
### Fixed
- Align span fields with backend DTO and add request event tracking
- Replace GZIP transport with plain JSON for compatibility
- Fix `shouldCapture` threshold from 500 to 400 (now captures 4xx errors like 401/403)
- Fix `ErrorEntry` field names: `status_code` → `status`, `url` → `route`

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
