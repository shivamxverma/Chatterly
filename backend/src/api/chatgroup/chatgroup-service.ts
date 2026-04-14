import {GetChatGroupResponse, CreateChatGroup, ChatbotResponse } from './chatgroup-types';
import { db } from '../../loaders/postgres';
import { chatGroup } from '../../db/schema';
import logger from '../../loaders/logger';
import ApiError from '../../utils/apiError';
import httpStatus from 'http-status';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

export const handleGetChatGroupForUser = async(
    userId: string
) : Promise<GetChatGroupResponse[]> => {
    try {
        const groups = await db
        .select({
            id: chatGroup.id,
            userId: chatGroup.userId,
            title: chatGroup.title,
            passcode: chatGroup.passcode,
            createdAt: chatGroup.createdAt
        })
        .from(chatGroup)
        .where(eq(chatGroup.userId,userId));

        return groups as unknown as GetChatGroupResponse[];
    } catch(error) {
        logger.error('Error fetching chatgroups:', error);
        throw new ApiError('Error fetching chatgroups', httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export const handleGetChatGroupById = async(
    userId: string,
    chatgroupId: string
) : Promise<GetChatGroupResponse> => {
    try {
        const group = await db
        .select({
            id: chatGroup.id,
            userId: chatGroup.userId,
            title: chatGroup.title,
            passcode: chatGroup.passcode,
            createdAt: chatGroup.createdAt
        })
        .from(chatGroup)
        .where(eq(chatGroup.id,chatgroupId));

        return group as unknown as GetChatGroupResponse;
    } catch(error) {
        logger.error('Error fetching chatgroup:', error);
        throw new ApiError('Error fetching chatgroup', httpStatus.INTERNAL_SERVER_ERROR);
    }
}

export const handleCreateTopic = async (
    userId: string,
    input : CreateChatGroup
) : Promise<ChatbotResponse> => {
    try {
        const chatgroup = await db
          .insert(chatGroup)
          .values({
            userId: userId,
            title: input.title,
            passcode: input.passcode,
          })
          .returning({
            id : chatGroup.id,
            userId : chatGroup.userId,
            title : chatGroup.title,
            passcode : chatGroup.passcode,
            createdAt : chatGroup.createdAt
          });

          return {
            success: true,
            message: 'Topic deleted successfully',
          };
    } catch(error){
        logger.error('Error creating topic:', error);
        if (error instanceof ApiError) {
        throw error;
        }
        throw new ApiError('Error creating topic', httpStatus.INTERNAL_SERVER_ERROR);
    }
}
