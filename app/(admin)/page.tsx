import { PATHNAME } from '@/utils/consts/pathname.const';
import { redirect } from 'next/navigation';

export default function Page() {
  redirect(PATHNAME.DASHBOARD);
}
