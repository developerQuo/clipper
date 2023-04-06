import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const serverSideAuthGuard: GetServerSideProps = async (context) => {
	const session = await getSession({ req: context.req });

	if (!session) {
		return {
			redirect: {
				destination: '/auth/signin',
				// destination: '/api/auth/signin',
				permanent: false,
			},
		};
	}

	return {
		props: { session },
	};
};

export default serverSideAuthGuard;
