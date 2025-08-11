import { create } from 'zustand'

export enum VerificationStatus {
  Idle = 'idle',
  Initialising = 'initialising',
  Analysing = 'analysing',
  Success = 'success',
}

type Store = {
  status: VerificationStatus
  isCameraReady: boolean
  isUnlocked: boolean
  setStatus: (status: VerificationStatus) => void
  setIsCameraReady: (isCameraReady: boolean) => void
  lock: () => void
  unlock: () => void
}

export const useFaceIDStore = create<Store>((set, get) => ({
  status: VerificationStatus.Idle,
  isCameraReady: false,
  isUnlocked: false,
  setStatus: (status) => {
    if (status === VerificationStatus.Analysing) {
      set({ status, isUnlocked: false })
      return
    }
    if (status === VerificationStatus.Success) {
      setTimeout(() => {
        set({ status: VerificationStatus.Idle, isUnlocked: true })
      }, 2000)
    }
    set({ status })
  },
  setIsCameraReady: (isCameraReady) => {
    set({ isCameraReady, status: isCameraReady ? VerificationStatus.Analysing : VerificationStatus.Idle })
  },
  lock: () => {
    set({ isUnlocked: false, status: VerificationStatus.Idle })
  },
  unlock: () => {
    const isCameraReady = get().isCameraReady
    set({ status: isCameraReady ? VerificationStatus.Analysing : VerificationStatus.Initialising })
  },
}))
