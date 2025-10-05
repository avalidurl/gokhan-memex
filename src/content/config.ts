import { defineCollection, z } from 'astro:content'

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    author: z.string().default('Gökhan Turhan'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    readingTime: z.number().optional(),
    excerpt: z.string().optional(),
    originalUrl: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
    schema: z.any().optional(),
  })
})

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    projectUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    tags: z.array(z.string()).default([]),
  })
})

export const collections = {
  blog,
  projects,
}