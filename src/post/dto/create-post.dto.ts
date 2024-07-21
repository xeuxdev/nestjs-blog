import { z } from 'zod';

export const CreatePostDtoSchema = z.object({
  title: z.string(),
  content: z.string(),
  full_content: z.string(),
  image: z.string().optional(),
});

export type CreatePostDto = z.infer<typeof CreatePostDtoSchema>;
