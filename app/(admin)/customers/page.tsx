import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Customers = dynamic(() => import('@/modules/customers'));

export const metadata: Metadata = {
  title: TITLE_PAGE.CUSTOMER.INDEX,
};

export default function Page() {
  return <Customers />;
}
