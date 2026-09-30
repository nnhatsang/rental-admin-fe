import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const Categories = dynamic(() => import('@/modules/categories'));

export const metadata: Metadata = {
  title: 'Danh mục sản phẩm',
};

export default function CategoriesPage() {
  return <Categories />;
}
