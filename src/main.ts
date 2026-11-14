import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { TransformInterceptor } from './utils/transform.interceptor.js';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe());
    // Global exception handling
    app.useGlobalFilters(new HttpExceptionFilter());

    // Global response transformation
    app.useGlobalInterceptors(new TransformInterceptor());

    const port = process.env.PORT ?? 3000;

    await app.listen(port);
    console.log(`Server running at http://localhost:${port}`);
}

bootstrap();
