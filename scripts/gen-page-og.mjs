#!/usr/bin/env node
// Runs after Astro: generate only our new page cards and missing legacy journal
// cards. Existing custom art, homepage, tracker, and art workstream stay intact.
import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises'
import { dirname, join, resolve, relative } from 'node:path'
import { renderCard } from './page-og-render.mjs'
const dist = resolve('dist')
const decode = s => s.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, v => ({'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>'}[v] ?? String.fromCodePoint(v[2].toLowerCase()==='x'?parseInt(v.slice(3,-1),16):parseInt(v.slice(2,-1),10))))
function meta(html, key) {
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    const attrs = Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]))
    if (attrs.property===key || attrs.name===key) return attrs.content ?? ''
  }
  return ''
}
async function* files(dir) {
  for (const ent of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
    const path=join(dir,ent.name)
    if (ent.isDirectory()) yield* files(path)
    else if (ent.name.endsWith('.html')) yield path
  }
}
let count=0
for await (const path of files(dist)) {
  const html=await readFile(path,'utf8');const url=meta(html,'og:url');if (!url) continue
  const route='/' + relative(dist,dirname(path)).split('\\').join('/') + '/';if (/^\/art(?:\/|$)/.test(route)) continue
  const image=meta(html,'og:image');if (!image) continue
  const asset=new URL(image,url);if(asset.hostname!=='gokhanturhan.com') continue
  const imagePath=decodeURIComponent(asset.pathname)
  const generated=imagePath.startsWith('/og/pages/')
  const missingJournal=route.startsWith('/journal/') && /^\/og\/[^/]+\.png$/.test(imagePath)
  if(!generated&&!missingJournal) continue
  const output=resolve(dist,'.'+imagePath);if(!output.startsWith(dist+'/'))throw new Error('Invalid card output path')
  if(!generated){try{await access(output);continue}catch{}}
  const title=meta(html,'og:title').replace(/ \| Gökhan Turhan$/u,'');const description=meta(html,'og:description')
  const section=route.split('/').filter(Boolean).join('/') || 'home'
  await mkdir(dirname(output),{recursive:true});await writeFile(output,renderCard({title,description,section}));count++
}
console.log(`[page-og] Generated ${count} distinct page cards; custom/home/tracker/art imagery preserved.`)
