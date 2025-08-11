'use client'
import { Leva } from 'leva'
import React, { type FC } from 'react'

type Props = {
  isMobile: boolean
}

const LevaControls: FC<Props> = ({ isMobile }) => {
  return <Leva titleBar={{ position: { x: 0, y: 56 } }} collapsed={isMobile} />
}

export default LevaControls
