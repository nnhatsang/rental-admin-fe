'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
  // return redirect('/dashboard');
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 500);

    return () => clearTimeout(timer);
  }, [router]);

  return <div>Đang chuyển hướng...</div>;
}
