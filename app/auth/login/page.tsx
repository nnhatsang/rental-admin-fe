import Login from '@/modules/auth/components/Login';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

export const metadata: Metadata = {
  title: TITLE_PAGE.AUTH.LOGIN,
};

const LoginPage: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
};

export default LoginPage;
