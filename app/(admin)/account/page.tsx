import type { Metadata } from 'next';

import { AccountPage } from '@/modules/account';

export const metadata: Metadata = {
  title: 'Tài khoản cá nhân',
};

export default function Page() {
  return <AccountPage />;
}
