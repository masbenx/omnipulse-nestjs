import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { OmniPulseConfig } from './types';
export declare class OmniPulseModule implements NestModule {
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
    static forRoot(config: OmniPulseConfig): DynamicModule;
    configure(consumer: MiddlewareConsumer): void;
}
//# sourceMappingURL=omnipulse.module.d.ts.map