import { UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express"
import * as jwt from 'jsonwebtoken';

export const authenticateJWT = (req: Request, res: Response, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
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