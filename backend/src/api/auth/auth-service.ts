import { db } from "../../loaders/postgres";
import {EmailPasswordRegisterRequest , RegisterResponse} from './auth-types';
import {
    authMethod as authMethodTable,
    user as userTable,
  } from '../../db/schema';
import { and, eq, is } from 'drizzle-orm';
import ApiError from "../../utils/apiError";
import httpStatus from 'http-status';
import logger from '../../loaders/logger';
import { v4 as uuidv4 } from 'uuid';
import { uniqueUsernameGenerator } from 'unique-username-generator';
import {usernameGeneratorConfig} from '../../utils/constants';
import { sendVerificationEmail } from "../emails/email-service";

import {
    hashPassword,
  } from './auth-helper';

export const handleEmailPasswordRegister = async (
    data: EmailPasswordRegisterRequest,
  ): Promise<RegisterResponse> => {
    const { email, password, displayName } = data;
  
    try {
      // Check if user with this email already exists in the user table
      const existingUser = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email));
  
      if (existingUser.length > 0) {
        throw new ApiError(
          'An account with this email already exists',
          httpStatus.CONFLICT,
        );
      }
  
      // Hash the password
      const passwordHash = await hashPassword(password);
      const newUserId = uuidv4();
      const verificationToken = uuidv4();
  
      // Create user and auth method in a transaction
      await db.transaction(async (tx) => {
        await tx
          .insert(userTable)
          .values({
            id: newUserId,
            updatedAt: new Date().toISOString(),
            email: email,
            displayName: displayName || email.split('@')[0],
            username: uniqueUsernameGenerator(usernameGeneratorConfig),
            isEmailVerified: false,
            verificationToken: verificationToken,
          });
  
        await tx.insert(authMethodTable).values({
          id: uuidv4(),
          updatedAt: new Date().toISOString(),
          userId: newUserId,
          email: email,
          passwordHash: passwordHash,
          provider: 'EMAIL_PASSWORD',
        });
      });
  
  
  
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
  
      logger.info('User registered, verification email sent:', newUserId);
  
      return {
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
  
      logger.error('Database error during email/password registration:', error);
      throw new ApiError(
        'Failed to create user account. Please try again later.',
        httpStatus.SERVICE_UNAVAILABLE,
      );
    }
  };