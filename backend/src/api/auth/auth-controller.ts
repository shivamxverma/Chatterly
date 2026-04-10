import catchAsync from "../../utils/catchAsync";
import { handleEmailPasswordRegister } from "./auth-service";
import httpStatus from 'http-status';
import type { Request, Response } from "express";
import type { EmailPasswordRegisterRequest } from "./auth-types";

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