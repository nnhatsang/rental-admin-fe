import DashboardNotFound from '@/components/shared/dashboard-not-found';
import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Metadata } from 'next';

function page() {
  return <DashboardNotFound />;
}

export default page;
export const metadata: Metadata = {
  title: TITLE_PAGE.NOT_FOUND,
};
