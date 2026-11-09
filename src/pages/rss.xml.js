import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import { plainPostTitle } from '@/lib/utils'

/** Channel contact; must match public site mailto (see cv.ts / privacy / disclaimer). */
const SITE_EMAIL = 'contact@gokhan.vc'

export async function GET(context) {
  const posts = await getCollection('blog')
  const publishedPosts = posts
    .filter(post => !post.data.draft)
    .sort((a, b) => new Date(b.data.publishDate).valueOf() - new Date(a.data.publishDate).valueOf())

  return rss({
    title: 'Gökhan Turhan — Journal',
    description: 'The journal of Gökhan Turhan: essays and notes on stablecoins, tokenization, agents, prediction markets, art and the products built at gokhanturhan.com.',
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
    site: context.site,
    items: publishedPosts.map(post => ({
      title: plainPostTitle(post.data.title),
      pubDate: post.data.publishDate,
      description: post.data.description,
      link: `/journal/${post.slug}/`,
      // guid = canonical URL (isPermaLink), set by @astrojs/rss from link
      categories: [post.data.category, ...(post.data.tags || [])].filter(Boolean),
      // RSS 2.0: author should be email (optional name in parentheses)
      author: `${SITE_EMAIL} (${post.data.author})`,
    })),
    customData: `
      <atom:link href="https://gokhanturhan.com/rss.xml" rel="self" type="application/rss+xml" />
      <language>en-us</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <managingEditor>${SITE_EMAIL} (Gökhan Turhan)</managingEditor>
      <webMaster>${SITE_EMAIL} (Gökhan Turhan)</webMaster>
      <copyright>© ${new Date().getFullYear()} Gökhan Turhan</copyright>
      <category>Technology</category>
      <category>Finance</category>
      <category>Research</category>
    `,
  })
}