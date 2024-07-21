import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { AuthGuard, User } from 'src/auth/auth.guard';
import { ZodValidationPipe } from 'src/lib/zod';
import {
  CreateCommentDto,
  createCommentDtoSchema,
} from './dto/create-comment.dto';
import { CreatePostDto, CreatePostDtoSchema } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostService } from './post.service';

interface RequestWithUser extends Request {
  user: User;
}

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @UseGuards(AuthGuard)
  @Post('create')
  @UsePipes(new ZodValidationPipe(CreatePostDtoSchema, 'Invalid Fields Data'))
  create(@Request() req: RequestWithUser) {
    return this.postService.create(req.body as CreatePostDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Put(':id/edit')
  update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: RequestWithUser,
  ) {
    return this.postService.update(id, updatePostDto, req.user);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  findUserPosts(@Request() req: RequestWithUser) {
    return this.postService.findUserPosts(req.user);
  }

  @Get('all')
  findAll(@Query('cursor') cursor: string) {
    return this.postService.findAll(cursor);
  }

  @Get('search')
  searchPost(@Query('term') term: string) {
    console.log(term);
    return this.postService.searchPost(term);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Put(':id/views')
  updateViews(@Param('id') id: string) {
    return this.postService.updatePostViews(id);
  }

  @Get(':id/comments')
  findComments(@Param('id') id: string) {
    return this.postService.findComments(id);
  }

  @Post(':id/comments/create')
  @UsePipes(
    new ZodValidationPipe(createCommentDtoSchema, 'Invalid Comments Data'),
  )
  createComment(
    @Body() createComment: CreateCommentDto,
    @Param('id') id: string,
  ) {
    console.log(id);
    return this.postService.createComment(id, createComment);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/delete')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    console.log(id, req);
    return this.postService.remove(id, req.user);
  }
}
