import { ClientRequest } from "http";
import { Request, Response } from 'express';
import { createProxyMiddleware } from "http-proxy-middleware";
import { promises } from 'node:dns';

export async function proxyMiddleware2(req: Request, res: Response, next) {

  let target;
  let cookieTarget;
  if (req.query && req.query.target) {
    if ((req.query.target as string).includes("192.168")) {
      console.log("invalid IP dectected. aborting.");
      return
    };

    try {
      let addresses: string[] = await promises.resolve4(req.query.target as string);
      if (addresses.some(a => a.includes("192.168"))) {
        console.log("invalid hostname detected. aborting.");
        return;
      };
    } catch (ex) {
      console.log('dns resolve error',ex);
    }

    console.log("QUERY TARGET", req.query.target);
    target = req.query.target;
    res.cookie('target', target, {domain: `.${req.hostname}`});
  }

  if (req.cookies && req.cookies.target && !req.query.target) {
    console.log("COOKIE TARGET", req.cookies.target);

    target = req.cookies.target;

    if (target.includes("/visual/"))
      target = `${target.split("/visual/")[0]}`;
  };

  if (req.query && req.query.maui) {
    // if ((req.query.maui as string).includes("192.168")) {
      //   console.log("invalid IP dectected. aborting.");
      //   return
      // };

      try {
        let addresses: string[] = await promises.resolve4(req.query.maui as string);
        // if (addresses.some(a => a.includes("192.168"))) {
          //   console.log("invalid hostname detected. aborting.");
          //   return;
          // };
        } catch (ex) {
          console.log('dns resolve error',ex);
        }

    console.log("MAUI", req.url);
    target = req.url.slice(7);
    if (req.url.includes("/visual/"))
      res.cookie('target', target, {domain: `.${req.hostname}`});
    console.log("MAUITARGET: " + target);
  }

  // if (target.includes("/ui/"))
  //   target = `${target.split("/ui")[0]}`;

  // if (target.includes("/visual/"))
  //   target = `${target.split("/visual/")[0]}`;

  // if (req.method === "POST" && Object.keys(req.query).length === 0) {
  //   let target = req.header('referer').split("?target=")[1];
  //   if (target) req.query.target = target;
  //   else {
  //     if (req.cookies.target) res.cookie('target', null, {domain: `.${req.hostname}`, expires: new Date(0)});
  //   }
  // }

  function onRewritePath(string: string):string {
    if (string.includes("?target")) return string.split("?")[0];
    else if (string.includes("?maui")) {
      string = string.split("?", 2)[1];
      return "";
    }
    else return string;
  }

  let proxy = createProxyMiddleware({
    target: `http://${target}`,
    changeOrigin: true,
    logger: console,
    pathRewrite: onRewritePath,
    secure: false
  })

  proxy(req, res, next);
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
      if (cookieTarget.includes("/visual/")) 
        return `http://${cookieTarget.split("/visual/")[0]}`;
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