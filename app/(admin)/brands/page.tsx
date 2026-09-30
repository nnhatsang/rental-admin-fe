import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Brands = dynamic(() => import('@/modules/brands'));

export const metadata: Metadata = {
  title: 'Thương hiệu sản phẩm',
};

export default function BrandsPage() {
  return <Brands />;
}
