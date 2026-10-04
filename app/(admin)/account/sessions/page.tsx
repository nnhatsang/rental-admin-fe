import type { Metadata } from 'next';

import { AccountSessions } from '@/modules/account/components/account-sessions';

export const metadata: Metadata = {
  title: 'Phiên đăng nhập',
};

export default function Page() {
  return <AccountSessions />;
}
