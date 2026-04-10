import ApiError from '../utils/apiError';
import logger from '../loaders/logger';
import httpStatus from 'http-status';
import nacl from 'tweetnacl';
import * as zlib from 'zlib';
import { CookieOptions } from 'express';
import { JWT_TOKEN_MAX_AGE } from './constants';
import { Buffer } from 'buffer';
import env from '../config';

export const jwtCookieOptions = (origin: string, isRefreshToken: boolean) => {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      domain: '.verlyai.xyz',
      maxAge: isRefreshToken
        ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
        : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
      path: '/',
    } as CookieOptions;
  }

  // Development mode - no domain for localhost compatibility
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    // domain is omitted in dev mode to work with localhost
    maxAge: isRefreshToken
      ? JWT_TOKEN_MAX_AGE.REFRESH_TOKEN
      : JWT_TOKEN_MAX_AGE.ACCESS_TOKEN,
  } as CookieOptions;
};

export const cleanString = (str?: string | null): string => {
  return (str ?? '')
    .replace(/\u0000/g, '')
    .replace('�', '')
    .trim();
};

export function decompressJSON(encoded: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gzData = Buffer.from(encoded, 'base64');
    zlib.gunzip(gzData, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export async function decompressJSONToObject<T = any>(
  encoded: string
): Promise<T> {
  try {
    if (!encoded || typeof encoded !== 'string') {
      logger.warn(
        'Invalid or empty encoded string provided for decompression, returning empty object'
      );
      return {} as T;
    }

    const buffer = await decompressJSON(encoded);
    const jsonString = buffer.toString();

    if (!jsonString) {
      logger.warn('Decompressed buffer is empty, returning empty object');
      return {} as T;
    }

    return JSON.parse(jsonString);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error in decompressJSONToObject, returning empty object:', {
      error: errorMessage,
      encodedLength: encoded?.length,
      encodedSample: encoded?.substring(0, 50) + '...',
    });
    return {} as T;
  }
}

export const roundToDecimals = (value: number, decimals: number): number => {
  if (decimals === undefined || decimals === null) return value;
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};


/**
 * Converts various timestamp formats to Unix timestamp in seconds
 * @param timestamp - Can be Date object, ISO string, Unix timestamp (seconds or milliseconds), or null/undefined
 * @returns Unix timestamp in seconds, or 0 if invalid input
 */
export const toUnixTimestamp = (
  timestamp: Date | string | number | null | undefined
): number => {
  if (!timestamp) return 0;

  try {
    // If it's already a number
    if (typeof timestamp === 'number') {
      // If it's in milliseconds (13 digits), convert to seconds
      if (timestamp > 1000000000000) {
        return Math.floor(timestamp / 1000);
      }
      // If it's already in seconds, return as is
      return Math.floor(timestamp);
    }

    // If it's a Date object
    if (timestamp instanceof Date) {
      return Math.floor(timestamp.getTime() / 1000);
    }

    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 0;
      }
      return Math.floor(date.getTime() / 1000);
    }

    return 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Ensures a value is a number, converting from string if necessary
 * @param value - The value to convert to number
 * @param defaultValue - Default value if conversion fails
 * @returns Number value
 */
export const ensureNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
};