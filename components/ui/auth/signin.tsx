import { getProviders, signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';

type InputProps = {
	loginRequired: boolean;
};

const get = async () => {
	const provider = await getProviders();
	return provider;
};

// login이 되있을 때, 이 페이지로 진입하면
// 개인화 설정 x -> 산업, 직무, 관심사 선택
// 개인화 설정 o -> 홈
const Login = ({ loginRequired }: InputProps) => {
	const [provider, setProvider] = useState<any>();
	useEffect(() => {
		get().then((res) => {
			if (res) {
				setProvider(res.google);
			}
		});
	}, [setProvider]);
	return (
		<div className="o">
			<div key={provider?.name}>
				<button className="btn rounded-lg" onClick={() => signIn(provider.id)}>
					Sign in with {provider?.name}
				</button>
			</div>
		</div>
	);
};

export default Login;
