import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { OmniPulseConfig } from './types';
import { Transport } from './transport';
export declare class OmniPulseExceptionFilter implements ExceptionFilter {
    private transport;
    private serviceName;
    private debug;
    constructor(config: OmniPulseConfig, transport: Transport);
    catch(exception: unknown, host: ArgumentsHost): void;
}
