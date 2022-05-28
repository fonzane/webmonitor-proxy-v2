import { UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express"
import * as jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next) => {
    const authHeader = req.headers.authorization;
    const authCookie = req.cookies.authorization;

    console.log('header: ', authHeader, 'cookie: ', authCookie);

    if (authCookie) {
        const token = authCookie;
        jwt.verify(token, jwtConstants.secret, (err, user) => {
            if (err) {
                throw new UnauthorizedException();
            }
            req['user'] = user;
            next()
        })
    } else {
        res.sendStatus(401);
    }
}

export const jwtConstants = {
    secret: 'secretKey'
}