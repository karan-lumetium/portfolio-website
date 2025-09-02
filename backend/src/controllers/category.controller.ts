import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth.types';
import prisma from '../config/database';

export class CategoryController {
  static async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
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
        data: { categories }
      });
    } catch (error) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch categories'
      });
    }
  }

  static async createCategory(req: AuthRequest, res: Response) {
    try {
      if (!req.user || req.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const { name, description } = req.body;

      const slug = name
        .toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');

      const existing = await prisma.category.findUnique({
        where: { slug }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Category already exists'
        });
      }

      const category = await prisma.category.create({
        data: { name, slug, description }
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create category'
      });
    }
  }
}
