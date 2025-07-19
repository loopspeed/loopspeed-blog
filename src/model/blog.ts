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

export const TOM_ISHERWOOD: Author = {
  name: 'Tom Isherwood',
}

export const JAMES_LESTER: Author = {
  name: 'James Lester',
}

export const ATANAS_DIMITROV: Author = {
  name: 'Atanas Dimitrov',
}

export const THEO_WALTON: Author = {
  name: 'Theo Walton',
}

export const ALL_AUTHORS: Author[] = [
  MATTHEW_FRAWLEY,
  EDUARD_RADD,
  TOM_ISHERWOOD,
  JAMES_LESTER,
  ATANAS_DIMITROV,
  THEO_WALTON,
]

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
