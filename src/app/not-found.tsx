import { Pathname } from '@/resources/pathname'
import { redirect } from 'next/navigation'
import { type FC } from 'react'

const NotFound: FC = () => {
  redirect(Pathname.Home)
}

export default NotFound
