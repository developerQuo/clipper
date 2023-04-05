import { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import Content from '@/components/ui/content';

export default function HomePage() {
	const [showChild, setShowChild] = useState(false);

	// Wait until after client-side hydration to show
	useEffect(() => {
		setShowChild(true);
	}, []);

	if (!showChild) {
		// You can show some kind of placeholder UI here
		return null;
	}

	return (
		<div>
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
