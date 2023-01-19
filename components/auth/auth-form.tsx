import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import NotificationContext from "../../store/notification-context";
import Button from "../ui/Button";

export interface IForm {
	username: string;
	password: string;
}

async function login(username: string, password: string) {
	const response = await fetch("/api/auth/signin", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ username, password }),
	});

	const data = await response.json();

	if (!response.ok) {
		throw new Error(data.message || "로그인을 실패했습니다.");
	}

	return data;
}

export default function AuthForm() {
	const notificationCtx = useContext(NotificationContext);
	const { register, handleSubmit, getValues } = useForm<IForm>();

	async function handleLogin() {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});
		const { username, password } = getValues();
		try {
			const result = await login(username, password);

			notificationCtx.showNotification({
				title: "로그인 성공!",
				message: result.message,
				status: "success",
			});
		} catch (error) {
			notificationCtx.showNotification({
				title: "로그인 실패!",
				message: (error as any).message,
				status: "error",
			});
		}
	}
	return (
		<section>
			<div className="flex justify-center">
				<h1 className="text-3xl font-bold">로그인</h1>
			</div>
			<form onSubmit={handleSubmit(handleLogin)}>
				<input hidden required defaultValue="admin" {...register("username")} />
				<div>
					<input type="password" required {...register("password")} />
				</div>
				<div>
					<Button className="btn-primary max-w-xs">로그인</Button>
				</div>
			</form>
		</section>
	);
}
