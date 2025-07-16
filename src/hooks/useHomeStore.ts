'use client'

import { create } from 'zustand'

export enum ContactMenuContent {
  GetInTouch = 'GetInTouch',
  Showreel = 'Showreel',
  BookCall = 'BookCall',
}

type Store = {
  // Contact Menu Visibility
  // Triggered by clicking the buttons:
  contactMenuContent: ContactMenuContent | null
  setContactMenuContent: (contactMenu: ContactMenuContent | null) => void
}

const useHomeStore = create<Store>((set) => ({
  contactMenuContent: null,
  setContactMenuContent: (contactMenuContent) => set({ contactMenuContent }),
}))

export default useHomeStore
