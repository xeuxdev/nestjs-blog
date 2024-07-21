import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from 'src/auth/auth.guard';
import { DatabaseService } from 'src/database/database.service';
import { APIResponse } from 'src/lib/response';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class PostService {
  constructor(private readonly db: DatabaseService) {}
  async create(createPostDto: CreatePostDto, req: User) {
    const { title, content, full_content, image } = createPostDto;

    const user = await this.db.user.findUnique({
      where: {
        id: req.id,
      },
    });

    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const newPost = await this.db.post.create({
      data: {
        title: title,
        content: content,
        full_content: full_content,
        image: image,
        author: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    if (!newPost) {
      throw new HttpException(
        'Failed to create post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return APIResponse('Post created Successfully', 201, {
      id: newPost.id,
    });
  }

  async update(post_id: string, updatePostDto: UpdatePostDto, req: User) {
    const { title, content, full_content, image } = updatePostDto;

    const editPost = await this.db.post.update({
      where: {
        id: post_id,
      },
      data: {
        title: title,
        content: content,
        full_content: full_content,
        image: image,
      },
    });

    if (!editPost) {
      return APIResponse(
        'Failed to update post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return APIResponse('Successfully Edited Post', HttpStatus.OK, {
      id: editPost.id,
    });
  }

  async findUserPosts(req: User) {
    try {
      const posts = await this.db.post.findMany({
        where: {
          user_id: req.id,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });

      const numOfPosts = await this.db.post.count({
        where: {
          user_id: req.id,
        },
      });

      const numOfComments = posts.reduce(
        (acc, cur) => acc + cur._count.comments,
        0,
      );

      const totalViews = posts.reduce((acc, cur) => acc + cur.viewCount, 0);

      const payload = {
        posts,
        numOfPosts,
        numOfComments,
        totalViews,
      };

      if (!posts) {
        throw Error('unable to find posts');
      }

      return APIResponse('success', 200, payload);
    } catch (error: any) {
      return APIResponse(error.message, error.status);
    }
  }

  async findAll(cursor: string) {
    const limit = 10;

    try {
      let postsQuery;

      if (!cursor) {
        postsQuery = this.db.post.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: { author: { select: { name: true } } },
        });
      } else {
        postsQuery = this.db.post.findMany({
          orderBy: { createdAt: 'desc' },
          skip: parseInt(cursor.toString()),
          take: limit,
          include: { author: { select: { name: true } } },
        });
      }

      const posts = await postsQuery;
      const postsLength = await this.db.post.count();

      if (!posts) {
        throw new HttpException(
          'Failed to Fetch Posts',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const hasNextPage = postsLength > parseInt(`${cursor}`) + limit;
      const nextCursor = hasNextPage
        ? (parseInt(`${cursor}`) + limit).toString()
        : 'null';

      const payload = { posts, nextCursor, hasNextPage };

      return APIResponse('Success', 200, payload);
    } catch (error) {
      return APIResponse(error.message, error.status);
    }
  }

  async findOne(id: string) {
    const post = await this.db.post.findUnique({
      where: {
        id: id,
      },
      include: {
        comments: {
          orderBy: {
            updatedAt: 'desc',
          },
        },
        author: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!post) {
      return APIResponse('Post not found', HttpStatus.NOT_FOUND);
    }

    return APIResponse('Post Found', HttpStatus.OK, post);
  }

  async searchPost(searchTerm: string) {
    console.log(searchTerm);
    if (!searchTerm) {
      return APIResponse('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const posts = await this.db.post.findMany({
      where: {
        title: {
          contains: searchTerm.toString(),
        },
      },
    });

    if (!posts) {
      return APIResponse('No Posts Found', HttpStatus.NOT_FOUND);
    }

    return APIResponse('Posts Found', HttpStatus.OK, posts);
  }

  async updatePostViews(post_id: string) {
    const editPost = await this.db.post.update({
      where: {
        id: post_id,
      },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });

    if (!editPost) {
      return APIResponse(
        'Failed to update post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return APIResponse('Successfully Edited Post', HttpStatus.OK, {
      id: editPost.id,
    });
  }

  async createComment(post_id: string, createCommentDto: CreateCommentDto) {
    const { comment, commenter_name } = createCommentDto;

    const newComment = await this.db.comment.create({
      data: {
        comment: comment,
        commenter_name: commenter_name,
        post_id: post_id,
      },
    });

    if (!newComment) {
      return APIResponse(
        'Failed to create comment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return APIResponse('Comment Added Successfully', HttpStatus.OK);
  }

  async findComments(post_id: string) {
    if (!post_id) {
      return APIResponse('Bad Request', HttpStatus.BAD_REQUEST);
    }

    const comments = await this.db.comment.findMany({
      where: {
        post_id: post_id,
      },
    });

    if (!comments) {
      return APIResponse('Comments Not Found', HttpStatus.NOT_FOUND);
    }

    return APIResponse('Comments Found', HttpStatus.OK, { comments });
  }

  async remove(post_id: string, req: User) {
    const user = await this.db.user.findUnique({
      where: {
        id: req.id,
      },
    });

    if (!user) {
      return APIResponse('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const deletePost = await this.db.post.delete({
      where: {
        id: post_id,
      },
    });

    if (!deletePost) {
      return APIResponse(
        'Failed to delete post',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return APIResponse('Post Deleted Successfully', HttpStatus.OK);
  }
}
