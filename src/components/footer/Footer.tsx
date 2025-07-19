'use client'
import Image from 'next/image'
import Link from 'next/link'
import React, { type FC } from 'react'

import linkedInIcon from '@/assets/icons/socials/linkedin.svg'
import CopyEmail from '@/components/footer/CopyEmail'
import LocalTime from '@/components/footer/LocalTime'

const Footer: FC = () => {
  return (
    <footer
      id="footer"
      className="relative z-100 flex w-full flex-col justify-center bg-black px-4 py-4 sm:px-8 md:py-3 xl:py-4">
      <div className="flex w-full max-w-7xl flex-col items-center justify-between gap-3 lg:flex-row">
        <div className="flex items-center sm:gap-2">
          <LocalTime />
          <CopyEmail />
          <Link href="https://linkedin.com/company/loopspeed" rel="noreferrer" target="_blank">
            <Image src={linkedInIcon} alt="LinkedIn" width={24} height={24} className="size-6" sizes="24px" />
          </Link>
        </div>

        <p className="text-light/70 flex flex-col space-x-2 text-center font-mono text-[10px] leading-5 lg:text-right xl:flex-row">
          <span>
            © {new Date().getFullYear()} Loopspeed Ltd. All Rights Reserved. Company registered in England and Wales:
            11689086.{' '}
          </span>{' '}
          <span>VAT registration number: 346016225.</span>
          {/* <span>
            Read our
            <Link
              href="/legal/privacy-policy"
              target="_blank"
              rel="noreferrer"
              className="ml-1 cursor-pointer underline">
              Privacy Policy.
            </Link>
          </span> */}
        </p>
      </div>
    </footer>
  )
}

export default Footer

{
  /* <div className="order-1 flex items-center justify-center md:order-2 md:justify-end">
<a
  href="https://www.linkedin.com/in/matthewjfrawley/"
  rel="noreferrer"
  target="_blank"
  className={socialLinkClasses}
>
  <Image
    src={linkedInIcon}
    alt="LinkedIn"
    width={24}
    height={24}
    className="size-6"
    sizes="24px"
  />
</a>

<a
  href="https://www.youtube.com/@pragmattic-dev"
  rel="noreferrer"
  target="_blank"
  className={socialLinkClasses}
>
  <Image
    src={youtubeIcon}
    alt="YouTube"
    width={24}
    height={24}
    className="size-6"
    sizes="24px"
  />
</a>
</div> */
}
