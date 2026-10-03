import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/modules/dashboard'));

export default function Page() {
  return <Dashboard />;
}
