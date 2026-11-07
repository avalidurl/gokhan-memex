import test from 'node:test'
import assert from 'node:assert/strict'
import { layout, wrap, textWidth, renderCard } from './page-og-render.mjs'
test('Turkish and long headlines fit measured bounds without losing words',()=>{
 for(const title of ['Gökhan Turhan: İğne, ışık, şüphe ve özgürlük','A thoughtful long headline about projects, interdisciplinary research, and the future of our shared digital infrastructure', 'ExtraordinarilyLongUnbrokenToken'.repeat(5)]){
  const l=layout(title,'Real metadata description');assert(l.lines.every(s=>textWidth(s,l.size)<=1000));assert(l.lines.length*l.size*1.22<=245);assert.equal(l.lines.join('').replace(/\s/g,''),title.replace(/\s/g,''))
 }
})
test('PNG cards are 1200×630 and content-specific',()=>{
 const a=renderCard({title:'Gökhan — Projects',description:'Actual projects',section:'projects'});const b=renderCard({title:'Different page',description:'Another description',section:'journal'});assert.equal(a.readUInt32BE(16),1200);assert.equal(a.readUInt32BE(20),630);assert(!a.equals(b));assert(a.equals(renderCard({title:'Gökhan — Projects',description:'Actual projects',section:'projects'})))
})

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
test('post-build fills future journal cards, preserves custom/home/art and creates page cards',()=>{
 const dir=mkdtempSync(join(tmpdir(),'page-og-'))
 try{
  const put=(path,body)=>{mkdirSync(join(dir,'dist',path,'..'),{recursive:true});writeFileSync(join(dir,'dist',path),body)}
  const html=(route,image)=>`<meta property="og:url" content="https://gokhanturhan.com${route}"><meta property="og:image" content="https://gokhanturhan.com${image}"><meta property="og:title" content="Özgürlük &amp; İhtimaller | Gökhan Turhan"><meta property="og:description" content="A real page description">`
  put('journal/future/index.html',html('/journal/future/','/og/future.png').replace('https://gokhanturhan.com/journal/future/','https://example.org/original-post'))
  put('journal/custom/index.html',html('/journal/custom/','/og/custom.png'));put('og/custom.png','unchanged-custom')
  put('cv/index.html',html('/cv/','/og/pages/cvhash.png'))
  put('index.html',html('/','/og/gokhan-turhan-v2.png'));put('og/gokhan-turhan-v2.png','approved-home')
  put('art/index.html',html('/art/','/og/pages/arthash.png'))
  execFileSync(process.execPath,[new URL('./gen-page-og.mjs',import.meta.url).pathname],{cwd:dir})
  assert(existsSync(join(dir,'dist/og/future.png')));assert(existsSync(join(dir,'dist/og/pages/cvhash.png')))
  assert.equal(readFileSync(join(dir,'dist/og/custom.png'),'utf8'),'unchanged-custom');assert.equal(readFileSync(join(dir,'dist/og/gokhan-turhan-v2.png'),'utf8'),'approved-home');assert(!existsSync(join(dir,'dist/og/pages/arthash.png')))
 }finally{rmSync(dir,{recursive:true,force:true})}
})
