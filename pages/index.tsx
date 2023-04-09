import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import Content from '@/components/ui/content';
import Filter from '@/components/ui/content/filter';

export default function HomePage() {
	const [showChild, setShowChild] = useState(false);

	const [keyword, setKeyword] = useState('');
	const [timeFilter, setTimeFilter] = useState('1_week');
	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}

	const handleSearch = (searchTerm: string) => {
		setKeyword(searchTerm);
	};

	const handleTimeFilterChange = (filter: string) => {
		setTimeFilter(filter);
	};

	return (
		<div className="space-y-12 px-10 py-16">
			<div className="flex items-center justify-between px-2">
				<h1 className="space-y-2 text-xl">
					<p>안녕하세요. 오늘 발간된 보고서들을 선택하세요.</p>
					<p className="font-bold">
						클리퍼가 보고서를 쉽게 이해하게 도와드릴게요!
					</p>
				</h1>
				<div className="flex justify-end">
					<Filter
						onSearch={handleSearch}
						onTimeFilterChange={handleTimeFilterChange}
					/>
				</div>
			</div>
			<Content />
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
