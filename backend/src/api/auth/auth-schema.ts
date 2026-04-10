import * as yup from 'yup';

export const googleOauthSchema = yup.object().shape({
  code: yup.string().optional().nullable(),
  credential: yup.string().optional().nullable(),
  isVerify: yup.boolean().optional().default(false),
});

export const emailPasswordLoginSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().required('Password is required'),
});

export const emailPasswordRegisterSchema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[@$!%*?&#]/, 'Password must contain at least one special character')
    .required('Password is required'),
  displayName: yup.string().optional(),
});