import Login from '@/components/ui/auth/signin';
import Personalization from '@/components/ui/auth/personalization';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { GetServerSideProps } from 'next';
import { supabase } from '@/utils/supabase-client';

type InputProps = {
	guard: any;
};

// login이 되있을 때, 이 페이지로 진입하면
// 개인화 설정 x -> 산업, 직무, 관심사 선택
// 개인화 설정 o -> 홈
export default function SignIn({ guard }: InputProps) {
	const loginRequired = !guard?.props?.session;
	return (
		<div className="relative flex h-full min-h-screen min-w-[360px] flex-col">
			{loginRequired ? <Login /> : <Personalization />}
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	// 로그인 o && 개인화 설정 o -> redirect home
	if (guard.props?.session) {
		const { data } = await supabase
			.from('personalization')
			.select('id')
			.eq('user_id', guard.props.session.user.id)
			.single();

		if (data?.id) {
			return {
				redirect: {
					destination: '/',
					permanent: false,
				},
			};
		}
	}
	// 로그인 o && 개인화 설정 x -> 산업, 직무, 관심사 선택
	return {
		props: { guard },
	};
};
