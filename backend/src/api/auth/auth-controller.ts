import catchAsync from "../../utils/catchAsync";
import { handleEmailPasswordRegister, handleEmailPasswordLogin,handleGoogleOauth } from "./auth-service";
import httpStatus from 'http-status';
import type { Request, Response } from "express";
import type { EmailPasswordRegisterRequest } from "./auth-types";
import { verifyEmail as verifyEmailService,handleRefreshToken } from "./auth-service";
import {setAuthCookies} from './auth-helper';
import { isAllowedOrigin,buildGoogleAuthUrl,verifyOAuthState } from '../../loaders/googleOAuth';
import {jwtCookieOptions}  from '../../shared/helper';

export const emailPasswordRegister = catchAsync(
  async (req: Request, res: Response) => {
    const response = await handleEmailPasswordRegister(
      req.body as EmailPasswordRegisterRequest,
    );
  
    // No cookies to set for register anymore as we don't log them in automatically
  
    res.status(httpStatus.CREATED).json({
      success: true,
      message: response.message,
    });
  },
);

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const token = req.query.token as string;
  
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Verification token is required',
      });
    }
  
    await verifyEmailService(token);
  
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Email verified successfully. You can now login.',
    });
  });
  

export const emailPasswordLogin = catchAsync(async (req: Request, res: Response) => {
    const response = await handleEmailPasswordLogin(req.body);
    const origin = req.headers.origin || req.headers.referer || '';
  
    const responseData = setAuthCookies(res, response, origin);
  
    res.status(httpStatus.OK).json({
      success: true,
      message: 'Login successful',
      data: responseData,
    });
});

export const googleOauth = catchAsync(async (req: Request, res: Response) => {
  const response = await handleGoogleOauth(req.body);
  const origin = req.headers.origin || req.headers.referer || '';

  if (!response.accessToken && !response.refreshToken) {
    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Google oauth successful',
      data: response,
    });
  }

  const responseData = setAuthCookies(res, response, origin);

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Google oauth successful',
    data: responseData,
  });
});
  

export const initiateGoogleAuth = catchAsync(async (req: Request, res: Response) => {
  const headerOrigin = (req.headers.origin as string | undefined) || undefined;
  const queryOrigin = (req.query.origin as string | undefined) || undefined;
  const chosenOrigin = queryOrigin || headerOrigin || '';

  if (!isAllowedOrigin(chosenOrigin)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Origin not allowed',
    });
  }

  const authUrl = buildGoogleAuthUrl(chosenOrigin);
  res.redirect(authUrl);
});

export const googleOAuthCallback = catchAsync(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const state = req.query.state as string | undefined;

  if (!code || !state) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Missing code or state',
    });
  }

  const { origin } = verifyOAuthState(state);

  const response = await handleGoogleOauth({ isVerify: false, code, credential: '' });

  setAuthCookies(res, response, origin);

  const redirectUrl = `${origin}/auth/callback`;
  res.redirect(302, redirectUrl);
});


export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenFromCookie = req.cookies?.['refreshToken'];

  if (!refreshTokenFromCookie) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Refresh token not provided',
    });
  }

  const response = handleRefreshToken(refreshTokenFromCookie);
  const origin = req.headers.origin || req.headers.referer || '';

  res.cookie('token', response.accessToken, jwtCookieOptions(origin, false));
  res.cookie(
    'refreshToken',
    response.refreshToken,
    jwtCookieOptions(origin, true),
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Refresh token refreshed successfully',
  });
});


export const logout = catchAsync(async (req: Request, res: Response) => {
  // use the same origin logic you used when setting the cookies
  const origin = req.headers.origin || req.headers.referer || '';

  res
    .clearCookie('token', jwtCookieOptions(origin, false)) // access-token cookie
    .clearCookie('refreshToken', jwtCookieOptions(origin, true)) // refresh-token cookie
    .status(httpStatus.OK)
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});