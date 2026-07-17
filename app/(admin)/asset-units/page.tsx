import { TITLE_PAGE } from '@/utils/consts/title-page.const';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AssetUnits = dynamic(() => import('@/modules/asset-units'));

export const metadata: Metadata = {
  title: TITLE_PAGE.ASSET_UNITS.INDEX,
};

export default function Page() {
  return <AssetUnits />;
}
