import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = { title: TITLE_PAGE.AVAILABILITY.INDEX };

export default function Page() {
  redirect('/availability/products');
}
