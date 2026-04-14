import catchAsync from "../../utils/catchAsync";
import { Request, Response, NextFunction } from 'express';
import { jwtReq } from '../../types';
import httpStatus from 'http-status';
import { handleGetChatGroupForUser, handleGetChatGroupById } from './chatgroup-service';

export const getChatbots = catchAsync(
    async (req: jwtReq, res: Response, next: NextFunction) => {
        const userId = req.user.userId as string;

        const chatbots = handleGetChatGroupForUser(userId);

        res.status(httpStatus.OK).json({
        success: true,
        message: 'Chatbots fetched successfully',
        data: chatbots,
        });
    }
);

export const getChatbotsById = catchAsync(
    async (req: jwtReq, res: Response, next: NextFunction) => {
        const chatgroupId = req.params.id;

        if (!chatgroupId) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Chatbot ID is required',
            });
        }

        const chatgroup = await handleGetChatGroupById(
            req.user.userId as string,
            chatgroupId
        );

        res.status(httpStatus.OK).json({
        success: true,
        message: 'Chatgroup fetched successfully',
        data: chatgroup,
        });
    }
);

