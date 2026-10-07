import { MailLayoutList } from '@/modules/mail-templates/components/mail-layout-list';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Layout email',
};

export default function Page() {
  return <MailLayoutList />;
}
