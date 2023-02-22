import { useRouter } from "next/router";
import { useCallback, useContext } from "react";
import { useForm } from "react-hook-form";
import NotificationContext from "../../store/notification-context";
import { FormError } from "../ui/FormError";

const title = "비밀번호 변경";

export interface IForm {
	oldPassword: string;
	newPassword: string;
}

export default function ChangePasswordForm() {
	const notificationCtx = useContext(NotificationContext);
	const router = useRouter();

	const { register, getValues, getFieldState, handleSubmit, formState } =
		useForm<IForm>();

	const onSubmit = useCallback(async () => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});
		const values = getValues();

		try {
			const response = await fetch("/api/user/change-password", {
				method: "PATCH",
				body: JSON.stringify(values),
				headers: {
					"Content-Type": "application/json",
				},
			});

			const result = await response.json();

			if (result?.ok) {
				notificationCtx.showNotification({
					title: `${title} 성공`,
					message: `${title}이 완료되었습니다.`,
					status: "success",
				});
				router.replace("/");
			} else {
				notificationCtx.showNotification({
					title: `${title} 실패`,
					message: result.message,
					status: "error",
				});
			}
		} catch (error: any) {
			notificationCtx.showNotification({
				title: `${title} 실패`,
				message: error.message,
				status: "error",
			});
		}
	}, [notificationCtx, getValues, router]);

	return (
		<form className="form space-y-4" onSubmit={handleSubmit(onSubmit)}>
			<input
				type="password"
				className="input-bordered input w-full"
				placeholder="기존 비밀번호"
				required
				{...register("oldPassword")}
			/>
			{getFieldState("oldPassword").error && (
				<FormError message={getFieldState("oldPassword").error?.message} />
			)}
			<input
				type="password"
				className="input-bordered input w-full"
				placeholder="새 비밀번호"
				required
				{...register("newPassword")}
			/>
			{getFieldState("newPassword").error && (
				<FormError message={getFieldState("newPassword").error?.message} />
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
