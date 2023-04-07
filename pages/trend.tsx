import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import dynamic from 'next/dynamic';
import Tabs from '@/components/ui/Tabs';

const loading = () => <div>Loading...</div>;
const WeeklyHot = dynamic(() => import('@/components/ui/content'), { loading });
const MonthlyHot = dynamic(() => import('@/components/ui/content'), {
	loading,
});

const menuArr = [
	{ name: 'Weekly Hot', pathName: 'weekly-hot', content: <WeeklyHot /> },
	{
		name: 'Monthly Hot',
		pathName: 'monthly-hot',
		content: <MonthlyHot />,
	},
];

export default function Trend() {
	return (
		<div className="px-10 py-16">
			<Tabs menuArr={menuArr} />
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	return {
		props: {},
	};
};
