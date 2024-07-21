import { z } from 'zod';

export const createUserSchema = z
  .object(
    {
      name: z.string(),
      email: z.string().email(),
      password: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
      confirmPassword: z
        .string()
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
    },
    { message: 'Invalid Credentials' },
  )
  .required()
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
      });
    }
  });

export type CreateUserDto = z.infer<typeof createUserSchema>;
