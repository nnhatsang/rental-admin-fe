import { Users } from '@/modules/users';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: TITLE_PAGE.USERS.INDEX,
};

export default function Page() {
  return <Users />;
}
