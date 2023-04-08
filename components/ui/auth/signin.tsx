import { getProviders, signIn } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type InputProps = {};

const get = async () => {
	const provider = await getProviders();
	return provider;
};

const Login = ({}: InputProps) => {
	const [provider, setProvider] = useState<any>();
	useEffect(() => {
		get().then((res) => {
			if (res) {
				setProvider(res.google);
			}
		});
	}, [setProvider]);
	return (
		<>
			<div className="hero min-h-screen bg-base-100">
				<div className="hero-content text-center">
					<div className="max-w-lg ">
						<Image
							className="mx-auto"
							src="/images/logo/clipper_logo.png"
							alt="Logo"
							width={306}
							height={96}
						/>
						{/* <h1 className="text-5xl font-bold">Clipper</h1> */}
						<p className="mt-12 text-text-secondary">
							AI Report Assistant for Business & Research
						</p>
						<div key={provider?.name} className="mt-32">
							<button
								className="btn w-96 rounded-3xl p-2 text-sm"
								onClick={() => signIn(provider.id)}
							>
								구글 로그인
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
