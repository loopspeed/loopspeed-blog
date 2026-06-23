import { createOpenGraphImage } from '@/lib/utils/openGraphImage'
import { BLOG_CONTENT } from '@/resources/blog'
import { BlogSlug } from '@/resources/pathname'
import { SEO } from '@/resources/seo'

type Context = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return Object.values(BlogSlug)
    .filter((slug) => !!BLOG_CONTENT[slug]?.Demo)
    .map((slug) => ({
      slug,
    }))
}

export async function GET(_request: Request, { params }: Context) {
  const { slug } = await params
  const metadata = BLOG_CONTENT[slug as BlogSlug]?.metadata

  return createOpenGraphImage({
    eyebrow: 'Demo',
    title: metadata ? `${metadata.title} Demo` : SEO.defaultTitle,
    subtitle: metadata?.description ?? SEO.defaultDescription,
  })
}
