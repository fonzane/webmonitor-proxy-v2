import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as nocache from 'nocache';
import * as onHeaders from 'on-headers';
import { Logger } from '@nestjs/common';
import { authenticateJWT } from './jwt-auth-middleware';
import { proxyMiddleware2 } from './proxy-middleware';

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.use(nocache());
  app.use((req, res, next) => {
    onHeaders(res, () => {
        res.removeHeader('ETag');
    });
    next();
  });
  app.use(authenticateJWT, proxyMiddleware2);

  await app.listen(3333);
  Logger.log('[NestApp] Server listening on port 3333');
}

bootstrap();