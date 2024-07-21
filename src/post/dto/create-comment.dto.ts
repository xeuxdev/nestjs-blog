import { z } from 'zod';

export const createCommentDtoSchema = z.object({
  comment: z.string(),
  commenter_name: z.string(),
});

export type CreateCommentDto = z.infer<typeof createCommentDtoSchema>;
