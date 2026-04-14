import rateLimit from 'express-rate-limit';
import { Request } from 'express';

export default rateLimit({
  windowMs: 1 * 60 * 1000, // 5 minutes
  max: 200, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP, please try again in 5 minutes!',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for resource-intensive endpoints like fetching trades
export const heavyEndpointLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 15, // Limit each IP to 20 requests per window
  message: 'This endpoint is heavily used. Please try again in 2 minutes!',
  standardHeaders: true,
  legacyHeaders: false,
});
