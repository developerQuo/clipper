import type { NextPage } from "next";
import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import useClientSideAuthGuard from "../components/utils/useClientSideAuthGuard";
import AuthForm from "../components/auth/auth-form";

const SignIn: NextPage = () => {
	const [isLogin, setIsLogin] = useState(true);

	function switchMode() {
		setIsLogin((prevState) => !prevState);
	}

	const title = isLogin ? "로그인" : "회원가입";

	useClientSideAuthGuard();

	return (
		<div className="page">
			<div className="hero min-h-screen">
				<div className="hero-content flex-col">
					<div className="text-center">
						<h2 className="text-xl">성공하는 사람들의 성장 습관</h2>
						<h3 className="text-2xl font-bold">{title}</h3>
					</div>
					<AuthForm isLogin={isLogin} title={title} />
					<div>
						New to Wiillus?{" "}
						<button
							className="btn-ghost btn text-secondary"
							onClick={switchMode}
						>
							{!isLogin ? "로그인" : "회원가입"}
						</button>
					</div>
					<div className="card flex-shrink-0">
						<div className="card-body">
							<button
								className="h-[46px] w-[191px] bg-google-sign-in focus:bg-google-sign-in-focus active:bg-google-sign-in-pressed"
								onClick={() => signIn("google")}
							></button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignIn;
