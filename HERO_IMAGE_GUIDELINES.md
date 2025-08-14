# Hero Image Guidelines

## Problem
Some blog posts have duplicate hero images - one from frontmatter `heroImage` that displays automatically at the top, and another manually added in the content body.

## Solution

### For Blog Posts WITH heroImage in frontmatter:
- **DO NOT** add the same image manually in the post content
- The `heroImage` field automatically displays at the top of the post
- Only add additional images that are different from the hero image

### For Blog Posts WITHOUT heroImage in frontmatter:
- You can add images manually in the content using `ResponsiveImage`
- The first image becomes the de-facto hero image

## Example of CORRECT Usage:

**posts/example.mdx**
```yaml
---
title: "My Post"
heroImage: "/blog/images/my-hero.webp"  # This shows at top automatically
---

# Content starts here
No need to repeat the hero image manually.

<ResponsiveImage 
  src="/blog/images/different-content-image.webp"  # Different image OK
  alt="Content illustration"
/>
```

## Fixed Issues:
- ✅ playlist-7.mdx - Removed duplicate hero image from content
- ✅ Created this guideline to prevent future issues

## Automated Check:
Consider adding a build-time check that warns when the same image appears in both `heroImage` frontmatter and content body.