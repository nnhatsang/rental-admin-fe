// import Users from '@/modules/users';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';
const Users = dynamic(() => import('@/modules/users'));

export const metadata: Metadata = {
  title: TITLE_PAGE.USERS.INDEX,
};

export default function Page() {
  return <Users />;
}
