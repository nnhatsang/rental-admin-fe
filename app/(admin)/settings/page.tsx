import Settings from '@/modules/settings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cài đặt hệ thống',
};

export default function Page() {
  return <Settings />;
}
