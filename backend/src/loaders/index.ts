import Express from 'express';
import express from './express';

export default async ({
    expressApp,
} : {
    expressApp: Express.Application;
}) : Promise<void> => {
    express({ app: expressApp });
//   await getDrizzleClient();
//   await loadGoogleOAuthClient();
    logger.info('🛡️  Express loaded  🛡️');
    logger.info('🛡️  All modules loaded!  🛡️');
}