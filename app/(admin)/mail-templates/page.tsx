import MailTemplates from '@/modules/mail-templates';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mẫu email',
};

export default function Page() {
  return <MailTemplates />;
}
