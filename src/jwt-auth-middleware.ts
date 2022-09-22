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
            next();
        })
    } else {
        throw new UnauthorizedException();
    }
}