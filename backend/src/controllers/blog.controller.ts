import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import prisma from '../config/database';

export class BlogController {
  /**
   * Get all published blog posts
   * GET /api/blog/posts
   */
  static async getPosts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, category, tag, search } = req.query;
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause
      const where: any = { published: true };
      
      if (category) {
        where.category = {
          slug: category as string
        };
      }
      
      if (tag) {
        where.tags = {
          some: {
            slug: tag as string
          }
        };
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      // Get posts with pagination
      const [posts, total] = await Promise.all([
        prisma.blogPost.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { publishedAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            category: true,
            tags: true
          }
        }),
        prisma.blogPost.count({ where })
      ]);

      res.json({
        success: true,
        data: {
          posts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Get posts error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch posts'
      });
    }
  }

  /**
   * Get single blog post by slug
   * GET /api/blog/posts/:slug
   */
  static async getPost(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const post = await prisma.blogPost.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
              bio: true
            }
          },
          category: true,
          tags: true
        }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Increment view count
      await prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: post.viewCount + 1 }
      });

      res.json({
        success: true,
        data: { post }
      });
    } catch (error) {
      console.error('Get post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch post'
      });
    }
  }

  /**
   * Create new blog post (Admin only)
   * POST /api/blog/posts
   */
  static async createPost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const {
        title,
        content,
        excerpt,
        categoryId,
        tagIds,
        published,
        featuredImage
      } = req.body;

      // Generate slug from title
      const baseSlug = title
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
      
      // Check if slug exists and make it unique
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.blogPost.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create post
      const post = await prisma.blogPost.create({
        data: {
          title,
          slug,
          content,
          excerpt,
          featuredImage,
          published,
          publishedAt: published ? new Date() : null,
          authorId: req.user.userId,
          categoryId,
          tags: {
            connect: tagIds?.map((id: string) => ({ id })) || []
          }
        },
        include: {
          author: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          },
          category: true,
          tags: true
        }
      });

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: { post }
      });
    } catch (error) {
      console.error('Create post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create post'
      });
    }
  }

  /**
   * Update blog post (Admin only)
   * PUT /api/blog/posts/:id
   */
  static async updatePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { id } = req.params;
      const {
        title,
        content,
        excerpt,
        categoryId,
        tagIds,
        published,
        featuredImage
      } = req.body;

      // Check if post exists
      const existingPost = await prisma.blogPost.findUnique({
        where: { id }
      });

      if (!existingPost) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Update post
      const post = await prisma.blogPost.update({
        where: { id },
        data: {
          title,
          content,
          excerpt,
          featuredImage,
          published,
          publishedAt: published && !existingPost.published ? new Date() : existingPost.publishedAt,
          categoryId,
          tags: {
            set: [], // Clear existing tags
            connect: tagIds?.map((id: string) => ({ id })) || []
          }
        },
        include: {
          author: {
            select: {
              username: true,
              firstName: true,
              lastName: true
            }
          },
          category: true,
          tags: true
        }
      });

      res.json({
        success: true,
        message: 'Post updated successfully',
        data: { post }
      });
    } catch (error) {
      console.error('Update post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update post'
      });
    }
  }

  /**
   * Delete blog post (Admin only)
   * DELETE /api/blog/posts/:id
   */
  static async deletePost(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized'
        });
      }

      const { id } = req.params;

      // Check if post exists
      const post = await prisma.blogPost.findUnique({
        where: { id }
      });

      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      // Delete post
      await prisma.blogPost.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Post deleted successfully'
      });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete post'
      });
    }
  }
}
