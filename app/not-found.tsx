'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { IconArrowLeft } from '@tabler/icons-react';

import { SITE_TITLE } from '@/utils/consts/token.const';

export default function NotFound() {
  return (
    <div className="grid min-h-screen w-full xl:grid-cols-2">
      <div className="flex flex-col p-16">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-2 xl:justify-start">
          <div className="bg-primary flex size-8 items-center justify-center rounded-lg">
            <svg className="text-primary-foreground size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold">{SITE_TITLE}</span>
        </div>

        <div className="mt-8 flex flex-1 flex-col items-center justify-center text-center xl:items-start xl:text-start">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-sm font-semibold">404</span>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Page Not Found</h1>
          <p>Oops! The page you`&apos;`re trying to access doesn`&apos;`t exist.</p>
          <Link prefetch={false} replace href="/">
            <Button className="h-9 px-4 py-2 mt-8 cursor-pointer">
              <IconArrowLeft />
              <span>Go Back Home</span>
            </Button>
          </Link>
        </div>
      </div>
      <div className="relative hidden xl:block">
        <Image
          src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2187&auto=format&fit=crop"
          alt="Rental equipment workspace"
          fill
          className="object-cover opacity-80"
          priority
          sizes="50vw"
        />
      </div>
    </div>
  );
}
