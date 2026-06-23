/* eslint-disable @next/next/no-img-element */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

const IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const

type OpenGraphImageProps = {
  accent?: string
  eyebrow?: string
  subtitle?: string
  title: string
}

export const openGraphImageSize = IMAGE_SIZE
export const openGraphImageContentType = 'image/png'

const readPublicImageDataUrl = async (pathname: string, mimeType: string): Promise<string> => {
  const imageData = await readFile(join(process.cwd(), 'public', pathname), 'base64')

  return `data:${mimeType};base64,${imageData}`
}

const readOpenGraphFont = async (filename: string): Promise<ArrayBuffer> => {
  const fontData = await readFile(join(process.cwd(), 'assets/fonts', filename))
  const arrayBuffer = new ArrayBuffer(fontData.byteLength)

  new Uint8Array(arrayBuffer).set(fontData)

  return arrayBuffer
}

const getTitleFontSize = (title: string): number => {
  if (title.length > 92) return 38
  if (title.length > 74) return 44
  if (title.length > 56) return 50
  if (title.length > 46) return 56

  return 64
}

export async function createOpenGraphImage({
  accent = '#A6FFDF',
  eyebrow,
  subtitle,
  title,
}: OpenGraphImageProps): Promise<ImageResponse> {
  const [backgroundSrc, logoSrc, redHatDisplayMedium, redHatDisplayBold, redHatDisplayBlack] = await Promise.all([
    readPublicImageDataUrl('images/og-background.jpg', 'image/jpeg'),
    readPublicImageDataUrl('logo-type-dark.png', 'image/png'),
    readOpenGraphFont('RedHatDisplay-Medium.ttf'),
    readOpenGraphFont('RedHatDisplay-Bold.ttf'),
    readOpenGraphFont('RedHatDisplay-Black.ttf'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: 'center',
          background: '#040707',
          color: '#F4FFFB',
          display: 'flex',
          fontFamily: 'Red Hat Display',
          height: '100%',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          width: '100%',
        }}>
        <img
          alt=""
          src={backgroundSrc}
          style={{
            height: '100%',
            inset: 0,
            objectFit: 'cover',
            opacity: 0.92,
            position: 'absolute',
            width: '100%',
          }}
        />
        <div
          style={{
            background: `linear-gradient(180deg, rgba(3,8,8,0.42) 0%, rgba(3,8,8,0.62) 55%, rgba(3,8,8,0.84) 100%), radial-gradient(circle at 50% 42%, ${accent}24 0, transparent 46%)`,
            display: 'flex',
            inset: 0,
            position: 'absolute',
          }}
        />
        <div
          style={{
            border: '1px solid rgba(196,255,242,0.16)',
            display: 'flex',
            inset: 36,
            position: 'absolute',
          }}
        />
        <div
          style={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '62px 96px',
            position: 'relative',
            textAlign: 'center',
            width: '100%',
          }}>
          <img
            alt=""
            src={logoSrc}
            style={{
              filter: 'invert(1)',
              height: 42,
              marginBottom: 44,
              objectFit: 'contain',
              width: 430,
            }}
          />
          {eyebrow ? (
            <div
              style={{
                color: accent,
                display: 'flex',
                fontSize: 22,
                fontWeight: 900,
                letterSpacing: 0,
                marginBottom: 20,
                textTransform: 'uppercase',
              }}>
              {eyebrow}
            </div>
          ) : null}
          <div
            style={{
              color: '#F4FFFB',
              display: 'flex',
              fontSize: getTitleFontSize(title),
              fontWeight: 900,
              letterSpacing: 0,
              lineHeight: 1.04,
              maxWidth: 960,
              textShadow: '0 8px 32px rgba(0,0,0,0.36)',
              whiteSpace: 'pre-line',
            }}>
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                color: 'rgba(225,255,248,0.84)',
                display: 'flex',
                fontSize: 26,
                fontWeight: 700,
                lineHeight: 1.25,
                marginTop: 24,
                maxWidth: 850,
                textShadow: '0 6px 24px rgba(0,0,0,0.4)',
                whiteSpace: 'pre-line',
              }}>
              {subtitle}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...IMAGE_SIZE,
      fonts: [
        {
          name: 'Red Hat Display',
          data: redHatDisplayMedium,
          style: 'normal',
          weight: 500,
        },
        {
          name: 'Red Hat Display',
          data: redHatDisplayBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Red Hat Display',
          data: redHatDisplayBlack,
          style: 'normal',
          weight: 900,
        },
      ],
    },
  )
}
