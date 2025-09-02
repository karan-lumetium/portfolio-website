import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import prisma from '../config/database';

export class TagController {
  static async getTags(req: Request, res: Response) {
    try {
      const tags = await prisma.tag.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              posts: true,
              projects: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: { tags }
      });
    } catch (error) {
      console.error('Get tags error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tags'
      });
    }
  }

  static async createTag(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { name } = req.body;

      const slug = name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      const existing = await prisma.tag.findUnique({
        where: { slug }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Tag already exists'
        });
      }

      const tag = await prisma.tag.create({
        data: { name, slug }
      });

      res.status(201).json({
        success: true,
        message: 'Tag created successfully',
        data: { tag }
      });
    } catch (error) {
      console.error('Create tag error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create tag'
      });
    }
  }
}
