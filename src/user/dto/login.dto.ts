import { z } from 'zod';

export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/),
});

export type LoginUserDto = z.infer<typeof loginUserSchema>;
