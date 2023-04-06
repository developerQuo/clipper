import Login from '@/components/ui/auth/signin';
import Personalization from '@/components/ui/auth/personalization';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { GetServerSideProps } from 'next';

type InputProps = {
	guard: any;
};

export default function SignIn({ guard }: InputProps) {
	console.log(guard);
	const loginRequired = !guard?.props?.session;
	return (
		<div>{loginRequired ? <Login loginRequired /> : <Personalization />}</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	// console.log(guard);
	// if (!guard.hasOwnProperty('redirect'))
	// 	return {
	// 		redirect: {
	// 			destination: '/',
	// 			permanent: false,
	// 		},
	// };
	return {
		props: { guard },
	};
};
