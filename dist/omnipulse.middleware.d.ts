import { NestMiddleware } from '@nestjs/common';
export declare class OmniPulseMiddleware implements NestMiddleware {
    use(req: any, res: any, next: () => void): void;
}
