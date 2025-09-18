import { z } from 'zod';

const emailSchema = z
  .string({ required_error: "L'email est obligatoire." })
  .trim()
  .min(1, { message: "L'email est obligatoire." })
  .email({ message: 'Adresse email invalide.' });

const passwordSchema = z
  .string({ required_error: 'Le mot de passe est obligatoire.' })
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' });

const optionalNameSchema = z.preprocess(
  (value) => {
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  },
  z
    .string()
    .min(2, { message: 'Le prénom doit contenir au moins 2 caractères.' })
    .max(80, { message: 'Le prénom doit contenir moins de 80 caractères.' })
    .optional()
);

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: 'Le mot de passe est obligatoire.' })
    .min(1, { message: 'Le mot de passe est obligatoire.' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

const baseRegisterSchema = z
  .object({
    name: optionalNameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string({ required_error: 'Veuillez confirmer votre mot de passe.' })
      .min(1, { message: 'Veuillez confirmer votre mot de passe.' }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Les mots de passe ne correspondent pas.',
        path: ['confirmPassword'],
      });
    }
  });

export const registerFormSchema = baseRegisterSchema.transform(({ confirmPassword, ...rest }) => rest);

export type RegisterFormInput = z.input<typeof baseRegisterSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function validateRegisterForm(input: RegisterFormInput | Record<string, unknown>) {
  return baseRegisterSchema.safeParse(input);
}

export function validateLoginForm(input: Record<string, unknown>) {
  return loginFormSchema.safeParse(input);
}
