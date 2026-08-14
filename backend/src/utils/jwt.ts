import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserPayload } from '../types';

export const generateAccessToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessTokenExpiresIn as any,
  });
};

export const generateRefreshToken = (payload: UserPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshTokenExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwt.accessSecret) as UserPayload;
};

export const verifyRefreshToken = (token: string): UserPayload => {
  return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
};
