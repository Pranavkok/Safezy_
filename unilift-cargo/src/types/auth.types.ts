import { ForgotPasswordSchema } from '@/validations/auth/forgot-password';
import { LoginFormSchema } from '@/validations/auth/login';
import { PrincipalRegistrationSchema } from '@/validations/auth/principal-register';
import { ResetPasswordSchema } from '@/validations/auth/reset-password';
import {
  OtpVerificationFormSchema,
  SignUpFormSchema
} from '@/validations/auth/sign-up';

import { z } from 'zod';

export type LoginType = z.infer<typeof LoginFormSchema>;

export type SignUpType = z.infer<typeof SignUpFormSchema>;

export type PrincipalRegisterType = z.infer<typeof PrincipalRegistrationSchema>;

export type OtpType = z.infer<typeof OtpVerificationFormSchema>;

export type ForgotPasswordType = z.infer<typeof ForgotPasswordSchema>;

export type ResetPasswordType = z.infer<typeof ResetPasswordSchema>;
