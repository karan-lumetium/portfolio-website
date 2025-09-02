import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@portfolio.com' },
    update: {},
    create: {
      email: 'admin@portfolio.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
      isEmailVerified: true,
      bio: 'Portfolio site administrator'
    }
  });
  console.log('👤 Admin user created:', adminUser.email);

  // Create categories
  const categories = [
    { name: 'Web Development', slug: 'web-development', description: 'Web application development' },
    { name: 'Mobile Apps', slug: 'mobile-apps', description: 'Mobile application development' },
    { name: 'DevOps', slug: 'devops', description: 'DevOps and infrastructure' },
    { name: 'UI/UX Design', slug: 'ui-ux-design', description: 'User interface and experience design' }
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category
    });
  }
  console.log(`📁 Created ${categories.length} categories`);

  // Create tags
  const tags = [
    { name: 'React', slug: 'react' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'PostgreSQL', slug: 'postgresql' },
    { name: 'Docker', slug: 'docker' },
    { name: 'TailwindCSS', slug: 'tailwindcss' }
  ];

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag
    });
  }
  console.log(`🏷️  Created ${tags.length} tags`);

  // Create sample blog post
  const samplePost = await prisma.blogPost.create({
    data: {
      title: 'Welcome to My Portfolio',
      slug: 'welcome-to-my-portfolio',
      excerpt: 'This is my first blog post on my new portfolio website.',
      content: '# Welcome!\n\nThis is my professional portfolio website where I share my projects and blog posts about web development.',
      published: true,
      publishedAt: new Date(),
      authorId: adminUser.id,
      categoryId: (await prisma.category.findUnique({ where: { slug: 'web-development' } }))!.id
    }
  });
  console.log('📝 Sample blog post created');

  // Create sample project
  const sampleProject = await prisma.project.create({
    data: {
      title: 'Portfolio Website',
      slug: 'portfolio-website',
      shortDescription: 'A modern portfolio website built with React and Node.js',
      fullDescription: 'This portfolio website showcases my projects and blog posts. Built with React, TypeScript, Node.js, and PostgreSQL.',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      githubUrl: 'https://github.com/yourusername/portfolio-website',
      featured: true,
      authorId: adminUser.id,
      categoryId: (await prisma.category.findUnique({ where: { slug: 'web-development' } }))!.id
    }
  });
  console.log('🚀 Sample project created');

  console.log('✅ Database seed completed!');
  console.log('\n📧 Admin Login Credentials:');
  console.log('   Email: admin@portfolio.com');
  console.log('   Password: Admin@123456');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
