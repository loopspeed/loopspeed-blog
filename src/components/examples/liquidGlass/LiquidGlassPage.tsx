'use client'
import { useControls } from 'leva'
import Image from 'next/image'
import React from 'react'

import bgImage from '@/components/examples/liquidGlass/assets/bg.jpg'
import LiquidGlass from '@/components/examples/liquidGlass/LiquidGlass'

type RecipeKey = 'default' | 'subtle' | 'max' | 'clean'
type RefractionMode = 'standard' | 'polar' | 'prominent' | 'crystal'
type ContentKind = 'profile' | 'navbar'

type Recipe = {
  refractionMode: RefractionMode
  displacementScale: number
  chromaticAberration: number
  blurAmount: number
  saturationAmount: number
  tintOpacity: number
}

const DEFAULT_RECIPE: Recipe = {
  refractionMode: 'standard' as RefractionMode,
  displacementScale: 90,
  chromaticAberration: 12,
  blurAmount: 0.25,
  saturationAmount: 140,
  tintOpacity: 5,
}

const RECIPES: Record<RecipeKey, Recipe> = {
  default: DEFAULT_RECIPE,
  subtle: {
    refractionMode: 'standard',
    displacementScale: 70,
    chromaticAberration: 5,
    blurAmount: 0.15,
    saturationAmount: 120,
    tintOpacity: DEFAULT_RECIPE.tintOpacity,
  },
  max: {
    refractionMode: 'crystal',
    displacementScale: 190,
    chromaticAberration: 12,
    blurAmount: 0.35,
    saturationAmount: 240,
    tintOpacity: DEFAULT_RECIPE.tintOpacity,
  },
  clean: {
    refractionMode: 'standard',
    displacementScale: 0,
    chromaticAberration: 0,
    blurAmount: 0.4,
    saturationAmount: 130,
    tintOpacity: DEFAULT_RECIPE.tintOpacity,
  },
}

export default function LiquidGlassPage() {
  const [
    { refractionMode, chromaticAberration, displacementScale, blurAmount, saturationAmount, tintOpacity, content },
    set,
  ] = useControls(
    () => ({
      // Content selector (inside LiquidGlass)
      content: {
        label: 'Content',
        value: 'profile' as ContentKind,
        options: {
          'Profile Card': 'profile',
          'Simple Nav Bar': 'navbar',
        } as Record<string, ContentKind>,
      },
      // Presets
      recipe: {
        label: 'Recipe',
        value: 'default' as RecipeKey,
        options: {
          Default: 'default',
          'Subtle shimmer': 'subtle',
          'Maximal caustics': 'max',
          'Clean blur-only': 'clean',
        } as Record<string, RecipeKey>,
        onChange: (key: RecipeKey) => {
          const recipe = RECIPES[key]
          set(recipe)
        },
      },
      // Fine controls
      refractionMode: {
        label: 'Refraction',
        value: DEFAULT_RECIPE.refractionMode,
        options: {
          Standard: 'standard',
          Polar: 'polar',
          Prominent: 'prominent',
          Crystal: 'crystal',
        } as Record<string, RefractionMode>,
      },
      chromaticAberration: {
        label: 'Chromatic Aberration',
        value: DEFAULT_RECIPE.chromaticAberration,
        min: 0,
        max: 20,
        step: 1,
      },
      displacementScale: {
        label: 'Displacement Scale',
        value: DEFAULT_RECIPE.displacementScale,
        min: 0,
        max: 200,
        step: 5,
      },
      blurAmount: {
        label: 'Blur',
        value: DEFAULT_RECIPE.blurAmount,
        min: 0.05,
        max: 1.0,
        step: 0.05,
      },
      saturationAmount: {
        label: 'Saturation',
        value: DEFAULT_RECIPE.saturationAmount,
        min: 100,
        max: 300,
        step: 10,
      },
      tintOpacity: {
        label: 'Tint Opacity (%)',
        value: DEFAULT_RECIPE.tintOpacity,
        min: 5,
        max: 100,
        step: 5,
      },
    }),
    [RECIPES],
  )

  const tintClassName = `bg-white/${tintOpacity}`

  return (
    <main className="relative h-[300dvh] w-full overflow-y-scroll">
      <Image
        src={bgImage}
        width={1920}
        height={1080}
        quality={80}
        className="absolute inset-0 size-full object-cover"
        sizes="(min-width: 640px) 50vw, 100vw"
        alt="background"
      />

      <LiquidGlass
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
        refractionMode={refractionMode}
        chromaticAberration={chromaticAberration}
        displacementScale={displacementScale}
        blurAmount={blurAmount}
        saturationAmount={saturationAmount}
        tintClassName={tintClassName}>
        {content === 'profile' ? (
          // Profile Card
          <div className="px-24 py-16 font-bold text-white/90">
            <header className="mb-6">
              <h3 className="text-xl font-semibold">Dynamically sized content</h3>
            </header>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-semibold backdrop-blur">
                  JD
                </div>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm">Software Engineer</p>
                </div>
              </div>

              <div className="divide-y divide-white/10 overflow-hidden rounded-xl border border-white/10">
                <div className="grid grid-cols-3 gap-2 bg-white/5 p-3">
                  <span className="col-span-1 text-xs">Email</span>
                  <span className="col-span-2 text-right text-sm">john.doe@example.com</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white/[0.03] p-3">
                  <span className="col-span-1 text-xs">Location</span>
                  <span className="col-span-2 text-right text-sm">San Francisco, CA</span>
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white/5 p-3">
                  <span className="col-span-1 text-xs">Joined</span>
                  <span className="col-span-2 text-right text-sm">March 2023</span>
                </div>
              </div>
            </section>
          </div>
        ) : (
          // Nav Example
          <nav className="flex items-center gap-6 px-8 py-4 text-white/90">
            <span className="text-lg font-semibold tracking-wide">Brand</span>
            <ul className="ml-4 flex items-center gap-6 text-sm">
              <li>
                <a className="text-white/85 transition hover:text-white">Home</a>
              </li>
              <li>
                <a className="text-white/85 transition hover:text-white">Products</a>
              </li>
              <li>
                <a className="text-white/85 transition hover:text-white">About</a>
              </li>
              <li>
                <button className="rounded-full bg-white/10 px-4 py-2 font-medium transition hover:bg-white/15">
                  Contact
                </button>
              </li>
            </ul>
          </nav>
        )}
      </LiquidGlass>
    </main>
  )
}
