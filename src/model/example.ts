import type { BlogSlug, ExampleSlug } from '@/resources/pathname'
import type { TagName } from '@/resources/tags'

export type ExampleMetadata = {
  title: string
  tags: TagName[]
  slug: ExampleSlug
  authors: { name: string }[]
  date?: string
  description?: string
  youtubeUrl?: string
  githubUrl?: string
  blogSlug?: BlogSlug
}
