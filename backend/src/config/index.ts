import dotenv from 'dotenv';
import path from 'path';
import * as yup from 'yup';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envSchema = yup.object().shape({
  NODE_ENV: yup.string().oneOf(['dev', 'production']).default('dev'),
  DATABASE_URL: yup.string().required('Database URL is required'),
  PORT: yup.string().default('8020'),
  JWT_SECRET: yup.string().required(),
  JWT_REFRESH_SECRET: yup.string().required(),
  INTERNAL_API_KEY: yup.string().required(),
  ALLOWED_ORIGINS: yup.string(),
  LOG_LEVEL: yup
    .string()
    .oneOf(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),
  API_VERSION: yup.string().default('v1'),
  MAX_API_REQUEST_RETRIES: yup.number().integer().default(3),
  GOOGLE_CLIENT_ID: yup.string().required(),
  GOOGLE_CLIENT_SECRET: yup.string().required(),
  GOOGLE_REDIRECT_URI: yup.string().required(),
  GEMINI_API_KEYS: yup.string().optional(),
  GEMINI_API_KEY: yup.string().optional(), // Kept for backward compatibility
  // Azure OpenAI (Chat Completions)
  AZURE_OPENAI_ENABLED: yup.string().oneOf(['true', 'false']).default('false'),
  AZURE_OPENAI_ENDPOINT: yup
    .string()
    .when('AZURE_OPENAI_ENABLED', {
      is: 'true',
      then: (s) => s.required('AZURE_OPENAI_ENDPOINT is required when AZURE_OPENAI_ENABLED=true'),
      otherwise: (s) => s.optional(),
    }),
  AZURE_OPENAI_API_KEY: yup
    .string()
    .when('AZURE_OPENAI_ENABLED', {
      is: 'true',
      then: (s) => s.required('AZURE_OPENAI_API_KEY is required when AZURE_OPENAI_ENABLED=true'),
      otherwise: (s) => s.optional(),
    }),
  AZURE_OPENAI_API_VERSION: yup.string().default('2025-01-01-preview'),
  AZURE_OPENAI_CHAT_DEPLOYMENT: yup.string().default('gpt-4o-mini'),
  INGESTION_API: yup.string().required(),
  CRAWLER_API: yup
    .string()
    .default('https://crawler.apps.verlyai.xyz/api/v1'),
  RESPONSE_API_BASE_URL: yup.string().default('http://localhost:8030'),
  FACEBOOK_APP_ID: yup.string().optional(),
  FACEBOOK_APP_SECRET: yup.string().optional(),
  WHATSAPP_WEBHOOK_URL: yup.string().default('https://webhook-wa-mcnp.onrender.com/webhook'),
  SMTP_HOST: yup.string().default('smtp.hostinger.com'),
  SMTP_PORT: yup.number().default(465),
  SMTP_USER: yup.string().required(),
  SMTP_PASS: yup.string().required(),
  SMTP_VERIFY_URL: yup.string().default('https://verlyai.xyz'),
  FRONTEND_URL: yup.string().default('https://verlyai.xyz'),
  BLOB_READ_WRITE_TOKEN: yup.string().default(''),
  // LiveKit Voice Services
  LIVEKIT_URL: yup.string().optional(),
  LIVEKIT_API_KEY: yup.string().optional(),
  LIVEKIT_API_SECRET: yup.string().optional(),
  LIVEKIT_AGENT_NAME: yup.string().optional().default('voice-assistant'),
  LIVEKIT_OUTBOUND_TRUNK_ID: yup.string().optional(),
  LIVEKIT_SIP_DOMAIN: yup.string().optional().default('sip.livekit.cloud'), // Default or specific
});

// Load and parse the environment variables
const parsedEnv = envSchema.validateSync(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

const env = parsedEnv;

export default env;