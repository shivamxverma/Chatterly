import { adjectives, Config, nouns } from 'unique-username-generator';
import env from '../config/index';
import { v4 as uuidv4 } from 'uuid';

export const apiPrefix = '/api' + `/${env.API_VERSION}`;
export const loggerConfig = {
  level: env.LOG_LEVEL || 'info',
};

export const redisApiTtlMap = {
  getHolder: 180,
  getTrade: 60,
  getPriceHistory: 60,
  getSearch: 60,
  getTokenOverview: 172800,
};

export const chainSlugs = ['solana', 'base', 'sui'];
export const sortByOptions = ['rank', 'liquidity', 'volume24hUSD'];
export const sortTypeOptions = ['asc', 'dec'];

export enum UserSettingType {
  b1 = 'b1',
  b2 = 'b2',
  b3 = 'b3',
  s1 = 's1',
  s2 = 's2',
  s3 = 's3',
}

export const usernameGeneratorConfig: Config = {
  dictionaries: [adjectives, nouns],
};
