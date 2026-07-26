import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Availability = dynamic(() => import('@/modules/availability'));

export const metadata: Metadata = { title: TITLE_PAGE.AVAILABILITY.INDEX };

export default function Page() {
  return <Availability />;
}
