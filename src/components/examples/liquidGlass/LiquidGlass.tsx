'use client'
import { StaticImageData } from 'next/image'
import React, { type FC, type ReactNode, useId, useMemo } from 'react'
import { twMerge } from 'tailwind-merge'

import crystalRefraction from '@/components/examples/liquidGlass/assets/crystal-refraction.png'
import polarRefraction from '@/components/examples/liquidGlass/assets/polar-refraction.jpg'
import prominentRefraction from '@/components/examples/liquidGlass/assets/prominent-refraction.png'
import standardRefraction from '@/components/examples/liquidGlass/assets/standard-refraction.jpg'

function toHref(img: StaticImageData | string): string {
  return typeof img === 'string' ? img : img.src
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n))
const fmt = (n: number) => String(Number(n.toFixed(2)))

type LiquidGlassProps = {
  refractionMode?: 'standard' | 'polar' | 'prominent' | 'crystal'
  chromaticAberration?: number // 0..20
  blurAmount?: number // 0.05..1.00 (0.05 steps)
  saturationAmount?: number // 100..300 (10% steps)
  displacementScale?: number // 0..200
  tintClassName?: string
  className?: string
  children?: ReactNode
}

const LiquidGlass: FC<LiquidGlassProps> = ({
  refractionMode = 'standard',
  displacementScale = 100,
  chromaticAberration = 4,
  blurAmount = 0.05,
  saturationAmount = 140,
  tintClassName = 'bg-white/5',
  className,
  children,
}) => {
  const raw = useId()
  const uid = useMemo(() => raw.replace(/[^a-zA-Z0-9_-]/g, ''), [raw])
  const FILTER_ID = `lg-filter-${uid}`
  const EDGE_MASK_ID = `lg-edge-mask-${uid}`

  const displacementHref = useMemo(() => {
    const maps: Record<NonNullable<LiquidGlassProps['refractionMode']>, StaticImageData | string> = {
      standard: standardRefraction,
      polar: polarRefraction,
      prominent: prominentRefraction,
      crystal: crystalRefraction,
    }
    return toHref(maps[refractionMode])
  }, [refractionMode])

  const ca = useMemo(() => {
    const level = clamp(Math.round(chromaticAberration), 0, 20)

    // RadialGradient stop offset: 80% - 2% * level
    const stopOffsetPct = `${80 - 2 * level}%`

    // feFuncA.tableValues middle value: 0.05 * level (capped at 1)
    const tableMid = Math.min(1, level * 0.05)
    const tableValues = `0 ${fmt(tableMid)} 1`

    // (Legacy baseline scales kept but no longer used for final channel scales)
    const scaleRed = -50
    const scaleGreen = -(50 + 2.5 * level)
    const scaleBlue = -(50 + 5 * level)

    // Blur stdDeviation piecewise
    const stdDeviation = level === 0 ? 0.5 : level === 1 ? 0.4 : level === 2 ? 0.3 : level === 3 ? 0.2 : 0.1

    return { level, stopOffsetPct, tableValues, scaleRed, scaleGreen, scaleBlue, stdDeviation }
  }, [chromaticAberration])

  // === New: displacement scales derived from displacementScale + CA ===
  const scales = useMemo(() => {
    const L = clamp(Math.round(chromaticAberration), 0, 20)
    // Accept negatives defensively, but spec is 0..200
    const ds = clamp(Math.abs(displacementScale), 0, 200)

    // RED only follows displacementScale (0..200 → 0..-200)
    const red = -ds

    // If CA=0, all equal red; otherwise add per-level deltas
    const green = L === 0 ? -ds : -(ds + 5 * L)
    const blue = L === 0 ? -ds : -(ds + 10 * L)

    return { red, green, blue }
  }, [chromaticAberration, displacementScale])

  const { blurPx, saturatePct } = useMemo(() => {
    // quantize blurAmount to 0.05 steps between 0.05 and 1.00
    const lvl = clamp(blurAmount, 0.05, 1)
    const stepIndex = Math.round((lvl - 0.05) / 0.05)
    const blurPx = 4 + stepIndex * 2

    // quantize saturation to the nearest 10% between 100 and 300
    const sat = clamp(saturationAmount, 100, 300)
    const saturatePct = Math.round(sat / 10) * 10

    return { blurPx, saturatePct }
  }, [blurAmount, saturationAmount])
  return (
    <div className={twMerge('inline-block size-fit', className)}>
      {/* Shell creates a stacking context and shrink-wraps to content */}
      <div
        className={twMerge('relative isolate inline-block size-fit overflow-hidden rounded-[inherit]', tintClassName)}>
        <div
          role="presentation"
          className="z-below-max pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_1px_1px_0_var(--lg-highlight),_inset_0_0_5px_var(--lg-highlight)]"
        />

        {/* CONTENT BOX defines size */}
        <div className="relative inline-block size-fit">
          {/* SVG sized to the content box, behind everything */}
          <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full" aria-hidden="true">
            <defs>
              <radialGradient id={EDGE_MASK_ID} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="black" stopOpacity="0" />
                <stop offset={ca.stopOffsetPct} stopColor="black" stopOpacity="0" />
                <stop offset="100%" stopColor="white" stopOpacity="1" />
              </radialGradient>

              {/* EXPANDED FILTER REGION + OVERSCAN MAP (no tiling seams) */}
              <filter
                id={FILTER_ID}
                filterUnits="objectBoundingBox"
                x="-250%"
                y="-250%"
                width="700%"
                height="700%"
                colorInterpolationFilters="sRGB">
                {/* Overscan the displacement map so CA shifts near edges don't sample "empty" pixels */}
                <feImage
                  x="-100%"
                  y="-100%"
                  width="300%"
                  height="300%"
                  result="DISPLACEMENT_MAP"
                  href={displacementHref}
                  preserveAspectRatio="none"
                />
                <feColorMatrix
                  in="DISPLACEMENT_MAP"
                  type="matrix"
                  values={`0.3 0.3 0.3 0 0
                       0.3 0.3 0.3 0 0
                       0.3 0.3 0.3 0 0
                       0   0   0   1 0`}
                  result="EDGE_INTENSITY"
                />
                <feComponentTransfer in="EDGE_INTENSITY" result="EDGE_MASK">
                  <feFuncA type="discrete" tableValues={ca.tableValues} />
                </feComponentTransfer>

                <feOffset in="SourceGraphic" dx="0" dy="0" result="CENTER_ORIGINAL" />

                {/* RED only displacementScale */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="DISPLACEMENT_MAP"
                  scale={scales.red}
                  xChannelSelector="R"
                  yChannelSelector="B"
                  result="RED_DISPLACED"
                />
                <feColorMatrix
                  in="RED_DISPLACED"
                  type="matrix"
                  values={`1 0 0 0 0
                       0 0 0 0 0
                       0 0 0 0 0
                       0 0 0 1 0`}
                  result="RED_CHANNEL"
                />

                {/* GREEN base + 5 per CA level */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="DISPLACEMENT_MAP"
                  scale={scales.green}
                  xChannelSelector="R"
                  yChannelSelector="B"
                  result="GREEN_DISPLACED"
                />
                <feColorMatrix
                  in="GREEN_DISPLACED"
                  type="matrix"
                  values={`0 0 0 0 0
                       0 1 0 0 0
                       0 0 0 0 0
                       0 0 0 1 0`}
                  result="GREEN_CHANNEL"
                />

                {/* BLUE base + 10 per CA level */}
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="DISPLACEMENT_MAP"
                  scale={scales.blue}
                  xChannelSelector="R"
                  yChannelSelector="B"
                  result="BLUE_DISPLACED"
                />
                <feColorMatrix
                  in="BLUE_DISPLACED"
                  type="matrix"
                  values={`0 0 0 0 0
                       0 0 0 0 0
                       0 0 1 0 0
                       0 0 0 1 0`}
                  result="BLUE_CHANNEL"
                />

                <feBlend in="GREEN_CHANNEL" in2="BLUE_CHANNEL" mode="screen" result="GB_COMBINED" />
                <feBlend in="RED_CHANNEL" in2="GB_COMBINED" mode="screen" result="RGB_COMBINED" />

                <feGaussianBlur in="RGB_COMBINED" stdDeviation={ca.stdDeviation} result="ABERRATED_BLURRED" />
                <feComposite in="ABERRATED_BLURRED" in2="EDGE_MASK" operator="in" result="EDGE_ABERRATION" />
                <feComponentTransfer in="EDGE_MASK" result="INVERTED_MASK">
                  <feFuncA type="table" tableValues="1 0" />
                </feComponentTransfer>
                <feComposite in="CENTER_ORIGINAL" in2="INVERTED_MASK" operator="in" result="CENTER_CLEAN" />
                <feComposite in="EDGE_ABERRATION" in2="CENTER_CLEAN" operator="over" />
              </filter>
            </defs>
          </svg>

          {/* WARP overlay exactly covering the content box */}
          <span
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              filter: `url(#${FILTER_ID})`,
              backdropFilter: `blur(${blurPx}px) saturate(${saturatePct}%)`,
              WebkitBackdropFilter: `blur(${blurPx}px) saturate(${saturatePct}%)`,
            }}
          />

          {/* CONTENT always above overlays */}
          <div className="pointer-events-auto relative z-10">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default LiquidGlass
