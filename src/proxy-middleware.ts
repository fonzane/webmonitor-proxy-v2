import { NestMiddleware, UseGuards } from "@nestjs/common";
import { ClientRequest } from "http";
import { Request, Response } from 'express';
import { createProxyMiddleware } from "http-proxy-middleware";

export class ProxyMiddleware implements NestMiddleware {
  private proxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    router: this.customRouter,
    logger: console,
    pathRewrite: this.onRewritePath,
    on: {
      proxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
        let target;
        if (req.query.target) target = req.query.target;
        console.log('got target: ', target);
        if (target) {
          res.cookie('target', target);
        }
      }
    }
  })

  customRouter(req: Request) {
    let target = req.query.target;
    console.log('target in router: ', target);
    let cookieTarget = req.cookies.VPNIP;
    console.log('cookieTarget in router: ', cookieTarget);
    if (target) {
      return `http://${target}`;
    } else if (cookieTarget) {
      return `http://${cookieTarget}`;
    } 
  }
  
  onRewritePath(string: string):string {
    if (string.includes("?target")) return string.split("?")[0];
    else return string;
  }

  public use(req: Request, res: Response, next: (error?: any) => void) {
    console.log('auth? ', req.headers.authorization);
    this.proxy(req, res, next);
  }
}

export function proxyMiddleware(req, res, next) {
  new ProxyMiddleware().use(req, res, next);
}

function customRouter(req: Request) {
  let target = req.query.target;
  console.log('target in router: ', target);
  let cookieTarget = req.cookies.VPNIP;
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