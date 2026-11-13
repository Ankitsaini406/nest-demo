import { Injectable, Logger, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    private readonly logger = new Logger('HTTP');

    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();
        const { method, originalUrl } = req;

        this.logger.log(
            `Incoming request: ${method} ${originalUrl}`,
        );

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;
            const message = `${method} ${originalUrl}` + `${statusCode} - ${duration}ms`;

            if (statusCode >= 500) {
                this.logger.error(message);
            } else if (statusCode >= 400) {
                this.logger.warn(message);
            } else {
                this.logger.log(message);
            }
        });

        next();
    }
}
