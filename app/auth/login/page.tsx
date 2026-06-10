import Login from '@/components/auth/Login';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đăng nhập',
};

const LoginPage: React.FC = () => {
  return <Login />;
};

export default LoginPage;
