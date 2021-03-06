import { NestMiddleware } from "@nestjs/common";
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
  })

  customRouter(req: Request) {
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

  onRewritePath(string: string):string {
    if (string.includes("?target")) return string.split("?")[0];
    else return string;
  }

  public use(req: Request, res: Response, next: (error?: any) => void) {
    this.proxy(req, res, next);
  }
}

export function proxyMiddleware(req: Request, res: Response, next) {

  let proxy = createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    router: customRouter,
    logger: console,
    pathRewrite: onRewritePath,
    secure: false,
    on: {
      proxyReq: (proxyReq: ClientRequest, req: Request, res: Response) => {
        
      }
    }
  })

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

  if (req.method === "POST" && Object.keys(req.query).length === 0) {
    let target = req.header('referer').split("?target=")[1];
    if (target) req.query.target = target;
    else {
      if (req.cookies.target) res.cookie('target', null, {domain: `.${req.hostname}`, expires: new Date(0)});
    }
  }

  console.log('target in main ', req.query.target);
  console.log('cookies in main ', req.headers.cookie, req.cookies);
  let target;
  if (req.query.target) {
    target = req.query.target
    console.log('domain: ', req.hostname);
    res.cookie('target', target, {domain: `.${req.hostname}`})
    console.log('after setting cookie', res.getHeaders());
  };
  
  proxy(req, res, next);
}

// function customRouter(req: Request) {
//   let target = req.query.target;
//   console.log('target in router: ', target);
//   let cookieTarget = req.cookies.target;
//   console.log('cookieTarget in router: ', cookieTarget);
//   if (target) {
//     return `http://${target}`;
//   } else if (cookieTarget) {
//     return `http://${cookieTarget}`;
//   } 
// }

// function onRewritePath(string: string):string {
//   if (string.includes("?target")) return string.split("?")[0];
//   else return string;
// }