import { pgTable, serial, text, timestamp, varchar, integer, smallint, boolean, json, jsonb, decimal, index, uniqueIndex, uuid, foreignKey, unique, real, pgEnum, customType, primaryKey, date } from 'drizzle-orm/pg-core';
import { like, sql } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

export const authProvider = pgEnum('AuthProvider', [
    'GOOGLE_OAUTH',
    'EMAIL',
    'EMAIL_PASSWORD',
]);

export const user = pgTable(
    'users', 
    {
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        displayName : text('display_name').notNull(),
        email : text('email'),
        avatarUrl: text('avatar_url'),
        username: text('username'),
        isBanned: boolean('is_banned').default(false).notNull(),
        isEmailVerified: boolean('is_email_verified').default(false).notNull(),
        verificationToken: text('verification_token'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    }
)

export const authMethod = pgTable(
    'auth_method',
    {
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        id: text('id').primaryKey().notNull().$defaultFn(() => createId()),
        userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        googleSub: text('google_sub'),
        googleEmail: text('google_email'),
        provider: authProvider().notNull(),
        passwordHash: text('password_hash'),
        email: text(),
    }
)

export const chatGroup = pgTable(
    'chat_groups',
    {
        id : text('id').primaryKey().notNull().$defaultFn(() => createId()),
        userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        title : text('title').notNull(),
        passcode : text('pass_code'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    }, (table) => [
        index('chatgroup_id_idx').on(table.id),
        index('chat_group_user_id_idx').on(table.userId),
    ]
)

export const groupUser = pgTable(
    'group_users',
    {
        id : text('id').primaryKey().notNull().$defaultFn(() => createId()),
        groupId : text('group_id')
          .notNull()
          .references(() => chatGroup.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        displayName : text('display_name').notNull(),
        sessionId : text('session_id').notNull(),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    },
)

export const chat = pgTable(
    'chats',
    {
        id : text('id').primaryKey().notNull().$defaultFn(() => createId()),
        groupId : text('group_id').notNull().references(() => chatGroup.id, {onDelete: 'cascade', onUpdate: 'cascade'}),
        userId : text('user_id')
          .notNull()
          .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
        message : text('message'),
        file : text('file'),
        createdAt: timestamp('created_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
        updatedAt: timestamp('updated_at', { precision: 3, mode: 'string' })
            .default(sql`(now() AT TIME ZONE 'UTC'::text)`)
            .notNull(),
    }
)