import { UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express"
import * as jwt from 'jsonwebtoken';
import { jwtConstants } from "./jwt-secret";

export const authenticateJWT = (req: Request, res: Response, next) => {
    const authCookie = req.cookies.authorization;

    if (authCookie) {
        const token = authCookie;
        jwt.verify(token, jwtConstants.secret, (err, user) => {
            if (err) {
                throw new UnauthorizedException();
            }
            req['user'] = user;

            let target = req.query.target as string;
            let maui = req.query.maui as string;
            if (target) {
                if ((user.roles.includes("admin") || user.roles.includes("user")) && (!user.allowedIPs.length || !(user.allowedIPs as string[]).some(ip => target.includes(ip)))) {
                    throw new UnauthorizedException({
                        statusCode: 401,
                        message: "Unauthorized",
                        reason: "The User doesn't have permission to access the requested IP-Adress.",
                        solution: "Ask a privileged administrator for permission to access the requested resource."
                    });
                }
            }

            if (maui) {
                if ((user.roles.includes("admin") || user.roles.includes("user")) && (!user.allowedIPs.length || !(user.allowedIPs as string[]).some(ip => maui.includes(ip)))) {
                    throw new UnauthorizedException({
                        statusCode: 401,
                        message: "Unauthorized",
                        reason: "The User doesn't have permission to access the requested IP-Adress.",
                        solution: "Ask a privileged administrator for permission to access the requested resource."
                    });
                }
            }

            next();
        })
    } else {
        throw new UnauthorizedException();
    }
}