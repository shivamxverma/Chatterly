import { relations } from 'drizzle-orm';
import {
    user,
    groupUser,
    chatGroup,
    authMethod,
    chat
} from './schema';

export const userRelations = relations(user, ({ many }) => ({
  authMethods: many(authMethod),
  chatGroups: many(chatGroup),
}));

export const authMethodRelations = relations(authMethod, ({ one }) => ({
  user: one(user, {
    fields: [authMethod.userId],
    references: [user.id],
  }),
}));

export const chatGroupRelations = relations(chatGroup, ({ one, many }) => ({
  owner: one(user, {
    fields: [chatGroup.userId],
    references: [user.id],
  }),
  chats: many(chat),
  groupUsers: many(groupUser),
}));

export const groupUserRelations = relations(groupUser, ({ one }) => ({
  chatGroup: one(chatGroup, {
    fields: [groupUser.groupId],
    references: [chatGroup.id],
  }),
}));

export const chatRelations = relations(chat, ({ one }) => ({
  chatGroup: one(chatGroup, {
    fields: [chat.groupId],
    references: [chatGroup.id],
  }),
}));



