import { AvailabilityTimeline } from '@/modules/availability/components/availability-timeline';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: TITLE_PAGE.AVAILABILITY.INDEX };

export default function Page() {
  return <AvailabilityTimeline />;
}
