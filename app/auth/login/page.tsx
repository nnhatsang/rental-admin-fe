import Login from '@/components/auth/Login';
import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
