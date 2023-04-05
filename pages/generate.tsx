import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';

export default function Generate() {
	return <div className="space-y-8"></div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	return {
		props: {},
	};
};
