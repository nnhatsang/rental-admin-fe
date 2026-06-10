import ResetPassword from '@/components/auth/ResetPassword';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Đặt lại mật khẩu',
};

const ResetPasswordPage: React.FC = () => {
  return <ResetPassword />;
};

export default ResetPasswordPage;
