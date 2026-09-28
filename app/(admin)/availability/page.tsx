import Availability from '@/modules/availability';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: TITLE_PAGE.AVAILABILITY.INDEX };

export default function Page() {
  return <Availability />;
}