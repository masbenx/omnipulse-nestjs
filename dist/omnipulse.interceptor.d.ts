import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { OmniPulseConfig } from './types';
import { Transport } from './transport';
export declare class OmniPulseInterceptor implements NestInterceptor {
    private config;
    private transport;
    private serviceName;
    constructor(config: OmniPulseConfig, transport: Transport);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private recordSpan;
}
