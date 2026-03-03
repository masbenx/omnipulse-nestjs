import { DynamicModule, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { OmniPulseConfig } from './types';
export declare class OmniPulseModule implements NestModule {
    static forRoot(config: OmniPulseConfig): DynamicModule;
    configure(consumer: MiddlewareConsumer): void;
}
