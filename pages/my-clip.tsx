import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import dynamic from 'next/dynamic';
import Tabs from '@/components/ui/Tabs';
import Loading from '@/components/ui/Loading';

const loading = () => <Loading />;
const Bookmark = dynamic(() => import('@/components/ui/bookmark'), { loading });
const MyRequest = dynamic(() => import('@/components/ui/request/my-request'), {
	loading,
});

const menuArr = [
	{ name: 'Bookmark', pathName: 'bookmark', content: <Bookmark /> },
	{ name: 'My Request', pathName: 'my-request', content: <MyRequest /> },
	// { name: '마이리포트', pathName: 'my-report', content: <GeneratedContent /> },
];

export default function MyClip() {
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
