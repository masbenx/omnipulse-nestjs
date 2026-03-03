// ─────────────────────────────────────────────
// @omnipulse/nestjs — NestJS Dynamic Module
// OmniPulseModule.forRoot(config)
// ─────────────────────────────────────────────

import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { OmniPulseConfig, OMNIPULSE_CONFIG } from './types';
import { Transport } from './transport';
import { OmniPulseService } from './omnipulse.service';
import { OmniPulseInterceptor } from './omnipulse.interceptor';
import { OmniPulseExceptionFilter } from './omnipulse.filter';
import { OmniPulseMiddleware } from './omnipulse.middleware';

@Global()
@Module({})
export class OmniPulseModule implements NestModule {
    /**
     * Register OmniPulseModule globally with configuration.
     *
     * @example
     * ```typescript
     * // app.module.ts
     * import { OmniPulseModule } from '@omnipulse/nestjs';
     *
     * @Module({
     *   imports: [
     *     OmniPulseModule.forRoot({
     *       apiKey: process.env.OMNIPULSE_INGEST_KEY,
     *       serviceName: 'my-nestjs-api',
     *       endpoint: 'https://api.omnipulse.cloud',
     *       environment: process.env.NODE_ENV || 'production',
     *     }),
     *   ],
     * })
     * export class AppModule {}
     * ```
     */
    static forRoot(config: OmniPulseConfig): DynamicModule {
        const transport = new Transport(config);

        return {
            module: OmniPulseModule,
            providers: [
                {
                    provide: OMNIPULSE_CONFIG,
                    useValue: config,
                },
                {
                    provide: 'OMNIPULSE_TRANSPORT',
                    useValue: transport,
                },
                OmniPulseService,
                {
                    provide: APP_INTERCEPTOR,
                    useClass: OmniPulseInterceptor,
                },
                {
                    provide: APP_FILTER,
                    useClass: OmniPulseExceptionFilter,
                },
            ],
            exports: [OmniPulseService, OMNIPULSE_CONFIG, 'OMNIPULSE_TRANSPORT'],
        };
    }

    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(OmniPulseMiddleware).forRoutes('*');
    }
}
