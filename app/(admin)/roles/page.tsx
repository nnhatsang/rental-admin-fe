import Roles from '@/modules/roles';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: TITLE_PAGE.ROLES.INDEX,
};

export default function Page() {
  return <Roles />;
}
