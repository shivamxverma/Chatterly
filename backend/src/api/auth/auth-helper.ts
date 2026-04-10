import env from '../../config';
import logger from '../../loaders/logger';
import ApiError from '../../utils/apiError';
import httpStatus from 'http-status';
import { TokenPayload } from 'google-auth-library';
import { googleOAuthClient } from '../../loaders/googleOAuth';
import {
  authMethod as authMethodTable,
  user as userTable,
} from '../../db/schema';
import { db } from '../../loaders/postgres';
import { v4 as uuidv4 } from 'uuid';
import { Response } from 'express';
import { jwtCookieOptions } from '../../shared/helper';
import {
  GoogleAuthResponse,
  RefreshTokenResponse,
} from './auth-types';
import { uniqueUsernameGenerator } from 'unique-username-generator';
import { usernameGeneratorConfig } from '../../utils/constants';
import * as bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

export const verifyPassword = async (
    password: string,
    hash: string,
  ): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};
  

export const setAuthCookies = (
    res: Response,
    response: GoogleAuthResponse | RefreshTokenResponse,
    origin: string,
  ): Omit<typeof response, 'accessToken' | 'refreshToken'> => {
    if (response.accessToken) {
      res.cookie('token', response.accessToken, jwtCookieOptions(origin, false));
    }
    if (response.refreshToken) {
      res.cookie(
        'refreshToken',
        response.refreshToken,
        jwtCookieOptions(origin, true),
      );
    }
  
    const {
      accessToken: accessToken2,
      refreshToken: refreshToken2,
      ...responseData
    } = response;
  
    return responseData;
  };

  export const verifyGoogleCredentials = async (
    code?: string,
    credential?: string,
  ): Promise<{ credentialPayload: TokenPayload; oidcToken: string }> => {
    let credentialPayload: TokenPayload;
    let oidcToken: string;
  
    try {
      if (credential) {
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: credential,
          audience: env.GOOGLE_CLIENT_ID,
        });
        credentialPayload = ticket.getPayload() as TokenPayload;
        oidcToken = credential;
      } else if (code) {
        const { tokens } = await googleOAuthClient.getToken(code);
        if (!tokens.id_token) {
          throw new Error('No ID token received from Google');
        }
        const ticket = await googleOAuthClient.verifyIdToken({
          idToken: tokens.id_token,
          audience: env.GOOGLE_CLIENT_ID,
        });
        credentialPayload = ticket.getPayload() as TokenPayload;
        oidcToken = tokens.id_token;
      } else {
        throw new ApiError(
          'No valid authentication provided',
          httpStatus.UNAUTHORIZED,
        );
      }
  
      if (!credentialPayload?.sub) {
        throw new ApiError('Invalid credential payload', httpStatus.UNAUTHORIZED);
      }
  
      return { credentialPayload, oidcToken };
    } catch (error) {
      if (error instanceof ApiError) throw error;
  
      const errorMessage = credential
        ? 'Invalid credential token'
        : 'Invalid authorization code';
      logger.error(`${errorMessage}:`, error);
      throw new ApiError(errorMessage, httpStatus.UNAUTHORIZED);
    }
};

export const handleNewOauthUser = async (
    credentialPayload: TokenPayload,
    oidcToken: string,
  ): Promise<typeof userTable.$inferSelect> => {
    const newUserId = uuidv4();
  
    try {
      const userData = await db.transaction(async (tx) => {
        const [newUser] = await tx
          .insert(userTable)
          .values({
            id: newUserId,
            updatedAt: new Date().toISOString(),
            email: credentialPayload.email || null,
            displayName: credentialPayload.name || newUserId,
            avatarUrl: credentialPayload.picture || null,
            username: uniqueUsernameGenerator(usernameGeneratorConfig),
          })
          .returning();
  
        await tx.insert(authMethodTable).values({
          id: uuidv4(),
          updatedAt: new Date().toISOString(),
          userId: newUserId,
          googleSub: credentialPayload.sub,
          googleEmail: credentialPayload.email || null,
          provider: 'GOOGLE_OAUTH',
        });
  
        return newUser;
      });
  
      return userData;
    } catch (error) {
      logger.error('Transaction error in handleNewOauthUser:', error);
      throw new ApiError(
        'Database transaction failed while creating user',
        httpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };
  