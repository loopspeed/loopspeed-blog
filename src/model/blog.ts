import { BlogSlug, ExampleSlug } from "@/resources/pathname"

type Author = {
  name: string
}

export type BlogMetadata = {
  title: string
  description: string
  date: string
  slug: BlogSlug
  tags: string[]
  authors: Array<Author>
  exampleSlug?: ExampleSlug
  isDraft?: boolean
}