import ResetPassword from '@/modules/auth/components/ResetPassword';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
};

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000/api';

interface PageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

const verifyResetPasswordToken = async (token: string): Promise<boolean> => {
  if (!token) return false;

  try {
    const url = new URL('admin/auth/reset-password/verify', `${API_BASE_URL.replace(/\/$/, '')}/`);
    url.searchParams.set('token', token);

    const response = await fetch(url, {
      cache: 'no-store',
    });

    return response.ok;
  } catch {
    return false;
  }
};

const ResetPasswordPage: React.FC<PageProps> = async ({ searchParams }) => {
  const { token } = await searchParams;
  if (!token) {
    notFound();
  }

  const isValidToken = await verifyResetPasswordToken(token);

  if (!isValidToken) {
    notFound();
  }

  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
