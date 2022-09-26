import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { authenticateJWT } from './jwt-auth-middleware';
import { proxyMiddleware2 } from './proxy-middleware';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  })
  app.use(authenticateJWT, proxyMiddleware2);

  await app.listen(3333);
  Logger.log('[NestApp] Server listening on port 3333');
}

bootstrap();