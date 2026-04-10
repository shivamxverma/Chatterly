import express from 'express';
import {
    emailPasswordRegisterSchema,
    emailPasswordLoginSchema,
    googleOauthSchema
} from './auth-schema';
import { validate } from '../../shared/middleware';
import { 
    emailPasswordRegister, 
    emailPasswordLogin ,
    verifyEmail,
    googleOauth,
    initiateGoogleAuth,
    googleOAuthCallback,
    refreshToken,
    logout
} from './auth-controller';

const app = express();

app.post('/register', validate('body', emailPasswordRegisterSchema), emailPasswordRegister);
app.post('/login', validate('body', emailPasswordLoginSchema), emailPasswordLogin);
app.get('/verify-email', verifyEmail);

// google oauth method
app.post('/google-oauth', validate('body', googleOauthSchema), googleOauth);

app.get('/google', initiateGoogleAuth);

// Redirect-based Google OAuth (callback)
app.get('/google/callback', googleOAuthCallback);

// refresh token route
app.post('/refresh-token', refreshToken);

// logout route
app.post('/logout', logout);


export default app;