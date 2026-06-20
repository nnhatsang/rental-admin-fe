import ForgotPassword from '@/modules/auth/components/ForgotPassword';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quên mật khẩu',
};

const ForgotPasswordPage: React.FC = () => {
  return <ForgotPassword />;
};

export default ForgotPasswordPage;
