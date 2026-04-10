import userRouter from './user/user-router';
import authRouter from './auth/auth-router';
import chatGroupRouter from './chatgroup/chatgroup-router';
import chatRouter from './chat/chat-router';
import userGroupRouter from './usergroup/usergroup-router'

import { Router } from 'express';

const routes = [
    { path: '/auth', router: authRouter },
    { path: '/user', router: userRouter },
    { path: '/chat-group', router: chatGroupRouter },
    { path: '/chat', router: chatRouter },
    { path: '/chat-group-user', router: userGroupRouter }
]

export default (): Router => {
    const app = Router();
    routes.forEach((route) => {
        app.use(route.path, route.router);
    });
    return app;
};