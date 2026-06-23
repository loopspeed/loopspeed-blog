import { createOpenGraphImage, openGraphImageContentType, openGraphImageSize } from '@/lib/utils/openGraphImage'

export const alt = 'Loopspeed Blog'
export const size = openGraphImageSize
export const contentType = openGraphImageContentType

export default function Image() {
  return createOpenGraphImage({
    eyebrow: 'Blog',
    title: 'Web Engineering\nNotes and Experiments',
    subtitle: 'Next.js, TypeScript, 3D, shaders,\nand production patterns.',
  })
}
