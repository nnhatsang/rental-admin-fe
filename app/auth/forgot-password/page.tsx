import ForgotPassword from '@/modules/auth/components/ForgotPassword';
import type { Metadata } from 'next';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';

export const metadata: Metadata = {
  title: TITLE_PAGE.AUTH.FORGOT_PASSWORD,
};

const ForgotPasswordPage: React.FC = () => {
  return <ForgotPassword />;
};

export default ForgotPasswordPage;
