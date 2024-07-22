import { z } from 'zod';

export const CreateCommentDtoSchema = z.object({
  comment: z.string(),
  commenter_name: z.string(),
});

export type CreateCommentDto = z.infer<typeof CreateCommentDtoSchema>;
