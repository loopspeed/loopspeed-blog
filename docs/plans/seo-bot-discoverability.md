HADNOFF FROM ANOTHER AI CHAT

Plan
Stepwise Implementation Plan: Loopspeed Blog SEO
Summary
Implement the blog SEO update one reviewable step at a time. Use the same website patterns for JSON-LD, SEO constants, bot discovery, and dynamic OG images. For blog/article OG eyebrows, default to “Blog” unless a clearly better page-specific label exists.

Steps
Shared SEO Foundation

Add blog SEO constants, canonical helper, and shared JsonLd component.
Add structured data builder utilities for Organization, WebSite, Blog listing, BlogPosting, and CreativeWork.
Do not wire pages yet.
Metadata, Robots and Sitemap

Update root/listing/post/demo metadata with canonicals, OG, Twitter, locale, authors, article fields, and sensible robots rules.
Replace static robots.txt with robots.ts.
Improve sitemap dates using post metadata instead of “today”.
Add public/llms.txt.
Wire Structured Data

Replace existing inline JSON-LD and JSONSchema output with shared JsonLd.
Add listing Blog/ItemList, post BlogPosting, and demo CreativeWork.
Ensure URLs/images use canonical helpers, not raw env values.
Dynamic OG Images

Copy the website OG template and required assets/fonts.
Add dynamic OG routes for homepage, blog posts, and demo pages.
Use eyebrow “Blog” for article OG images and for fallback page cases.
Remove/replace obsolete static OG image usage where appropriate.
Verification and Polish

Run TypeScript, lint/build where supported.
Smoke-test /robots.txt, /sitemap.xml, /llms.txt, homepage OG, one article OG, and one demo OG.
Visually inspect generated OG images for line breaks, overflow, logo, background, and font weights.
First Step To Implement
Step 1/5: Shared SEO Foundation

Likely files:

src/resources/seo.ts
src/resources/jsonLd.ts
src/components/JsonLd.tsx
Intentionally unfinished:

No route metadata changes yet.
No robots/sitemap changes yet.
No OG image routes yet.
Assumptions
Canonical blog host is https://blog.loopspeed.co.uk.
Blog post OG images use existing MDX metadata; no new required post image field.
Demo pages remain indexable only when their parent post is published and the demo is included in sitemap.
The main website’s JSON-LD and OG implementation is the source pattern to mirror.


Steps Step 2/5 complete. 
Next step: wire structured data rendering through the shared JsonLd component and remove the old inline/legacy JSON-LD usage.