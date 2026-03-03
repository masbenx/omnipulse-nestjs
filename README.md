# @omnipulse/nestjs

Official NestJS SDK for [OmniPulse](https://omnipulse.cloud) — Automatic request tracing, error capture, and structured logging for NestJS 10+ applications.

## Features

- 🔄 **Auto Request Tracing** — Interceptor traces every HTTP request (duration, route, status)
- 🛡️ **Exception Capture** — Global filter captures 5xx errors automatically
- 📝 **Structured Logging** — Injectable logger with `info`, `warn`, `error`, `debug`
- 🔗 **Distributed Tracing** — Middleware generates and propagates `trace_id` & `request_id`
- 📦 **NestJS-Native** — Uses `Module.forRoot()`, `@Injectable`, `Interceptor`, `ExceptionFilter`
- 🗜️ **GZIP Compression** — Efficient data transfer with batching
- 🔒 **Fail-Safe** — SDK never crashes your application

## Quick Start

### 1. Install

```bash
npm install @omnipulse/nestjs
```

### 2. Import Module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { OmniPulseModule } from '@omnipulse/nestjs';

@Module({
  imports: [
    OmniPulseModule.forRoot({
      apiKey: process.env.OMNIPULSE_INGEST_KEY!,
      serviceName: 'my-nestjs-api',
      endpoint: 'https://api.omnipulse.cloud',
      environment: process.env.NODE_ENV || 'production',
    }),
  ],
})
export class AppModule {}
```

**That's it!** The module automatically:
- ✅ Traces all HTTP requests (duration, status, route)
- ✅ Captures unhandled exceptions (5xx errors)
- ✅ Generates `trace_id` & `request_id` for distributed tracing
- ✅ Sets `x-trace-id` & `x-request-id` response headers

### 3. Use Logger in Services

```typescript
import { Injectable } from '@nestjs/common';
import { OmniPulseService } from '@omnipulse/nestjs';

@Injectable()
export class UsersService {
  constructor(private readonly omnipulse: OmniPulseService) {}

  async findAll() {
    this.omnipulse.logger.info('Fetching all users');

    try {
      const users = await this.userRepo.find();
      this.omnipulse.logger.info('Users fetched', { count: users.length });
      return users;
    } catch (err) {
      this.omnipulse.captureError(err as Error, { action: 'findAll' });
      throw err;
    }
  }
}
```

### 4. Test Connection

```typescript
import { Controller, Get } from '@nestjs/common';
import { OmniPulseService } from '@omnipulse/nestjs';

@Controller('health')
export class HealthController {
  constructor(private readonly omnipulse: OmniPulseService) {}

  @Get('omnipulse')
  async testOmniPulse() {
    const result = await this.omnipulse.test();
    return result;
  }
}
```

## What Gets Captured Automatically

### HTTP Requests (via Interceptor)
| Field | Description |
|-------|-------------|
| `trace_id` | Distributed trace ID |
| `http.method` | GET, POST, PUT, DELETE, etc. |
| `http.url` | Full request URL |
| `http.route` | NestJS route pattern |
| `http.status_code` | Response status code |
| `http.user_agent` | Client user agent |
| `http.client_ip` | Client IP address |
| `nestjs.controller` | Controller class name |
| `nestjs.handler` | Handler method name |
| `duration_ms` | Request duration in milliseconds |

### Exceptions (via Filter)
| Field | Description |
|-------|-------------|
| `type` | Error class name |
| `message` | Error message |
| `stack` | Stack trace |
| `url` | Request URL |
| `method` | HTTP method |
| `status_code` | HTTP status code |
| `trace_id` | Correlated trace ID |

## Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | *required* | Your OmniPulse Ingest Key |
| `serviceName` | `string` | `'nestjs-app'` | Application name |
| `environment` | `string` | `'production'` | Environment tag |
| `endpoint` | `string` | `'https://api.omnipulse.cloud'` | Backend URL |
| `debug` | `boolean` | `false` | Enable console debug logs |
| `flushIntervalMs` | `number` | `5000` | Batch flush interval (ms) |
| `batchSize` | `number` | `50` | Max entries before auto-flush |

## License

MIT
