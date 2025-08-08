import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'

export async function GET(context) {
  const posts = await getCollection('blog')
  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf())

  return rss({
    title: 'Gökhan Turhan',
    description: 'T-shaped generalist solopreneur, researcher, and conceptual artist operating across fintech, deep tech, competitive governance, art markets, and investment strategies.',
    site: context.site,
    items: publishedPosts.map(post => ({
      title: post.data.title,
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/journal/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `
      <language>en-us</language>
      <managingEditor>avalidurl@pm.me (Gökhan Turhan)</managingEditor>
      <webMaster>avalidurl@pm.me (Gökhan Turhan)</webMaster>
      <copyright>2025 Gökhan Turhan</copyright>
      <category>Technology</category>
      <category>Finance</category>
      <category>Research</category>
    `,
  })
}