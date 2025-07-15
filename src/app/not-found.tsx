import { redirect } from 'next/navigation'
import { type FC } from 'react'

import { Pathname } from '@/resources/pathname'

const NotFound: FC = () => {
  redirect(Pathname.Home)
}

export default NotFound
