import { readFileSync } from 'node:fs'
import path from 'node:path'
import type { Ebook } from '@/data/ebooks'

export type EbookLine = {
  number: number
  text: string
}

export type EbookPage = {
  pageNumber: number
  lines: EbookLine[]
}

export type EbookVerse = {
  verseNumber: number
  lines: EbookLine[]
  asemic?: string[]
}

export type EbookPageWithVerses = {
  pageNumber: number
  verses: EbookVerse[]
}

export const loadEbookLines = (ebook: Ebook): EbookLine[] => {
  const absolutePath = path.join(process.cwd(), ebook.sourceTextPath)
  const raw = readFileSync(absolutePath, 'utf-8').trim()

  return raw.split('\n').map((line) => {
    const match = line.match(/^(\d+)\s+(.*)$/)

    if (!match) {
      throw new Error(`Unable to parse line in ${ebook.sourceTextPath}: ${line}`)
    }

    return {
      number: Number(match[1]),
      text: match[2],
    }
  })
}

export const loadAsemicData = (dataPath: string): string[][] => {
  const absolutePath = path.join(process.cwd(), dataPath)
  return JSON.parse(readFileSync(absolutePath, 'utf-8'))
}

export const groupIntoVerses = (lines: EbookLine[], linesPerVerse: number, asemicData?: string[][]): EbookVerse[] => {
  const verses: EbookVerse[] = []
  for (let i = 0; i < lines.length; i += linesPerVerse) {
    const verseIndex = i / linesPerVerse
    verses.push({
      verseNumber: verseIndex + 1,
      lines: lines.slice(i, i + linesPerVerse),
      asemic: asemicData?.[verseIndex],
    })
  }
  return verses
}

export const paginateVerses = (verses: EbookVerse[], versesPerPage: number): EbookPageWithVerses[] => {
  const pages: EbookPageWithVerses[] = []
  for (let i = 0; i < verses.length; i += versesPerPage) {
    pages.push({
      pageNumber: pages.length + 1,
      verses: verses.slice(i, i + versesPerPage),
    })
  }
  return pages
}

export const paginateEbookLines = (lines: EbookLine[], linesPerPage: number): EbookPage[] => {
  const pages: EbookPage[] = []

  for (let index = 0; index < lines.length; index += linesPerPage) {
    pages.push({
      pageNumber: pages.length + 1,
      lines: lines.slice(index, index + linesPerPage),
    })
  }

  return pages
}
