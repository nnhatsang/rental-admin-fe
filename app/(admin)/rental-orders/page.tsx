import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const RentalOrders = dynamic(() => import('@/modules/rental-orders'));

export const metadata: Metadata = {
  title: 'Quản lý đơn thuê',
};

export default function Page() {
  return <RentalOrders />;
}
