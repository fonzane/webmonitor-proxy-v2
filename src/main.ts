import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { Logger } from '@nestjs/common';
import { authenticateJWT } from './jwt-auth-middleware';
import { proxyMiddleware } from './proxy-middleware';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use(authenticateJWT, proxyMiddleware);

  await app.listen(3333);
  Logger.log('[NestApp] Server listening on port 3333');
}

bootstrap();