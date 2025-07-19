import type { BlogSlug, ExampleSlug } from '@/resources/pathname'

type Author = {
  name: string
}

export const MATTHEW_FRAWLEY: Author = {
  name: 'Matthew Frawley',
}

export const EDUARD_RADD: Author = {
  name: 'Eduard Radd',
}

export const ALL_AUTHORS: Author[] = [MATTHEW_FRAWLEY, EDUARD_RADD]

export type BlogMetadata = {
  title: string
  description: string
  date: string
  slug: BlogSlug
  tags: string[]
  authors: Author[]
  exampleSlug?: ExampleSlug
  isDraft?: boolean
}
