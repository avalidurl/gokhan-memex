import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('blog')
  return posts.map(post => ({
    params: { slug: post.slug },
    props: { post },
  }))
}

export async function GET({ props }) {
  const { post } = props
  
  // Simple SVG-based OG image generation
  const svg = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="1200" height="630" fill="#1e293b"/>
      
      <!-- Grid pattern -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" stroke-width="1" opacity="0.1"/>
        </pattern>
      </defs>
      <rect width="1200" height="630" fill="url(#grid)"/>
      
      <!-- Content area -->
      <rect x="80" y="80" width="1040" height="470" fill="#334155" rx="16" opacity="0.3"/>
      
      <!-- Category badge -->
      <rect x="100" y="120" width="200" height="32" fill="#4f46e5" rx="16"/>
      <text x="200" y="140" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" font-weight="600">${post.data.category}</text>
      
      <!-- Title -->
      <text x="100" y="220" fill="white" font-family="Arial, sans-serif" font-size="48" font-weight="bold">
        <tspan x="100" dy="0">${post.data.title.length > 40 ? post.data.title.substring(0, 37) + '...' : post.data.title}</tspan>
      </text>
      
      <!-- Description -->
      <text x="100" y="280" fill="#94a3b8" font-family="Arial, sans-serif" font-size="24">
        <tspan x="100" dy="0">${post.data.description.length > 80 ? post.data.description.substring(0, 77) + '...' : post.data.description}</tspan>
        <tspan x="100" dy="35">${post.data.description.length > 80 ? post.data.description.substring(77, 154) + '...' : ''}</tspan>
      </text>
      
      <!-- Author and date -->
      <text x="100" y="420" fill="#64748b" font-family="Arial, sans-serif" font-size="18">
        ${post.data.author} • ${new Date(post.data.publishDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </text>
      
      <!-- Site branding -->
      <text x="1100" y="580" text-anchor="end" fill="#64748b" font-family="Arial, sans-serif" font-size="16">
        gokhanturhan.com
      </text>
      
      <!-- Accent line -->
      <rect x="100" y="450" width="1000" height="2" fill="#4f46e5"/>
    </svg>
  `
  
  // Convert SVG to PNG using ImageMagick via shell command
  const { exec } = await import('child_process')
  const { promisify } = await import('util')
  const execAsync = promisify(exec)
  
  try {
    // Write SVG to temp file and convert to PNG
    const tempSvg = `/tmp/og-${post.slug}.svg`
    const tempPng = `/tmp/og-${post.slug}.png`
    
    await import('fs').then(fs => 
      fs.promises.writeFile(tempSvg, svg)
    )
    
    await execAsync(`magick "${tempSvg}" "${tempPng}"`)
    
    // Read the generated PNG
    const pngBuffer = await import('fs').then(fs => 
      fs.promises.readFile(tempPng)
    )
    
    // Cleanup temp files
    await execAsync(`rm "${tempSvg}" "${tempPng}"`)
    
    return new Response(pngBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    })
  } catch (error) {
    console.error('OG image generation failed:', error)
    
    // Fallback to default image
    const defaultImage = await import('fs').then(fs => 
      fs.promises.readFile('./public/og-default.png')
    )
    
    return new Response(defaultImage, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  }
}