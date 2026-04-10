import express from 'express';
import {
    emailPasswordRegisterSchema
} from './auth-schema';
import { validate } from '../../shared/middleware';
import { emailPasswordRegister } from './auth-controller';

const app = express();

app.post('/register', validate('body', emailPasswordRegisterSchema), emailPasswordRegister);
app.post("/auth/login");


export default app;