import ResetPassword from '@/components/auth/ResetPassword';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
};

const ResetPasswordPage: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
};

export default ResetPasswordPage;
