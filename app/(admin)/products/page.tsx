import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Products = dynamic(() => import('@/modules/products'));

export const metadata: Metadata = {
  title: TITLE_PAGE.PRODUCTS.INDEX,
};

export default function Page() {
  return <Products />;
}
