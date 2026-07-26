import RentalOrderCreate from '@/modules/rental-orders/create';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tạo đơn thuê',
};

export default function Page() {
  return <RentalOrderCreate />;
}
