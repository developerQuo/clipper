import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import NotificationContext from "../../store/notification-context";
import { emailPattern } from "../../utils/patterns";
import { FormError } from "../ui/FormError";

export interface IForm {
	email: string;
	password: string;
}

async function createUser(email: string, password: string) {
	const response = await fetch("/api/auth/signup", {
		method: "POST",
		body: JSON.stringify({ email, password }),
		headers: {
			"Content-Type": "application/json",
		},
	});

	const result = await response.json();

	if (!response.ok) {
		throw new Error(result.message || "Something went wrong!");
	}

	return result;
}

type AuthFormProps = {
	title: string;
	isLogin: boolean;
};

export default function AuthForm({ title, isLogin }: AuthFormProps) {
	const notificationCtx = useContext(NotificationContext);
	const router = useRouter();

	const { register, getValues, getFieldState, handleSubmit, formState } =
		useForm<IForm>();

	const onSubmit = useCallback(async () => {
		notificationCtx.showNotification({
			title: "loading...",
			message: "",
			status: "pending",
		});
		const { email, password } = getValues();

		try {
			if (isLogin) {
				// login
				const result = await signIn("credentials", {
					redirect: false,
					email,
					password,
				});
				if (!result?.error) {
					notificationCtx.showNotification({
						title: `${title} 성공`,
						message: `${title}되었습니다.`,
						status: "success",
					});
					router.replace("/");
				} else {
					notificationCtx.showNotification({
						title: `${title} 실패`,
						message: result.error,
						status: "error",
					});
				}
			} else {
				// register
				const result = await createUser(email, password);
				notificationCtx.showNotification({
					title: `${title} 성공`,
					message: `${title}이 완료되었습니다.`,
					status: "success",
				});
				router.replace("/auth");
			}
		} catch (error: any) {
			notificationCtx.showNotification({
				title: `${title} 실패`,
				message: error.message,
				status: "error",
			});
		}
	}, [notificationCtx, getValues, isLogin, title, router]);

	return (
		<form className="form space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<input
				type="email"
				className="input-bordered input w-full"
				placeholder="Email"
				required
				{...register("email", {
					pattern: emailPattern,
				})}
			/>
			{getFieldState("email").error && (
				<FormError message={getFieldState("email").error?.message} />
			)}
			{getFieldState("email").error?.type === "pattern" && (
				<FormError message={"올바른 이메일 형식을 입력하세요."} />
			)}
			<input
				type="password"
				className="input-bordered input w-full"
				placeholder="비밀번호"
				required
				{...register("password")}
			/>
			{getFieldState("password").error && (
				<FormError message={getFieldState("password").error?.message} />
			)}
			<button
				disabled={!formState.isValid}
				// loading={loading}
				className="btn-primary btn w-full"
			>
				{title}
			</button>
		</form>
	);
}
