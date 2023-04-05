import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const loading = () => <div>Loading...</div>;
const Bookmark = dynamic(() => import('@/components/ui/bookmark'), { loading });
const GeneratedContent = dynamic(
	() => import('@/components/ui/generate/content'),
	{ loading },
);

const menuArr = [
	{ name: '북마크', pathName: 'bookmark', content: <Bookmark /> },
	{ name: '마이리포트', pathName: 'my-report', content: <GeneratedContent /> },
];

export default function MyClip() {
	const router = useRouter();
	const currentTab = router.query.tab || menuArr[0].pathName;
	return (
		<div className="space-y-12">
			<div className="tabs font-bold">
				{menuArr.map(({ name, pathName }, index) => (
					<li
						key={index}
						className={`tab tab-lg ${
							pathName === currentTab ? 'tab-active' : ''
						}`}
						onClick={() =>
							router.replace({
								pathname: router.pathname,
								query: { tab: pathName },
							})
						}
					>
						{name}
					</li>
				))}
			</div>
			<div className="">
				{menuArr.find(({ pathName }) => pathName === currentTab)!.content}
			</div>
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
