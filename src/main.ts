import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';
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

function customRouter(req: Request) {
  let target = req.query.target;
  console.log('target in router: ', target);
  let cookieTarget = req.cookies.target;
  console.log('cookieTarget in router: ', cookieTarget);
  if (target) {
    return `http://${target}`;
  } else if (cookieTarget) {
    return `http://${cookieTarget}`;
  } 
}

function onRewritePath(string: string):string {
  if (string.includes("?target")) return string.split("?")[0];
  else return string;
}