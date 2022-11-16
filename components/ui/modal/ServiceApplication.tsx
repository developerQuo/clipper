/* 오프라인 서비스 신청 */

import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import NotificationContext from "../../../store/notification-context";
import Button from "../Button";
import { ageOptions, genderOptions } from "../options";
import { AgeType, ApiResponseType, GenderType } from "../types";
import Modal from "./Modal";

const TITLE = "#BTRC 참여하기";

export interface IForm {
	name: string;
	phone: string;
	gender: GenderType;
	age: AgeType;
}

export default function ServiceApplication() {
	const notificationCtx = useContext(NotificationContext);
	const {
		register,
		getValues,
		getFieldState,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<IForm>();

	const router = useRouter();

	const [visible, setVisible] = useState<boolean | null>(true);

	const onSubmit = (data: IForm) => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});

		fetch("/api/service", {
			method: "POST",
			body: JSON.stringify(data),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data: ApiResponseType) => {
					throw new Error(`${TITLE}가 실패하였습니다.`);
				});
			})
			.then((data: ApiResponseType) => {
				notificationCtx.showNotification({
					title: "성공!",
					message: `${TITLE}가 완료되었습니다.`,
					status: "success",
				});
				setVisible(false);
				router.push("/");
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: "실패!",
					message: error.message,
					status: "error",
				});
			});
	};

	const [verified, setVerified] = useState(false);
	const watchPhone = watch("phone");

	const verify = () => {
		if (watchPhone) {
			setVerified(true);
		}
	};

	return (
		<Modal title={TITLE} {...(visible !== null && { hidden: !visible })}>
			<form
				className="flex flex-col gap-y-8 pt-[48px] md:gap-y-10"
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="flex flex-col gap-y-2">
					<div>
						<input
							type="text"
							className="input-bordered input w-full max-w-xs focus:border-secondary focus:text-secondary"
							placeholder="이름"
							{...register("name", { required: true })}
						/>
						{errors.name?.type === "required" && (
							<p role="alert" className="text-error">
								이름을 입력하세요.
							</p>
						)}
					</div>
					<div>
						<div className="flex gap-2">
							<input
								type="text"
								className="input-bordered input w-full max-w-xs focus:border-secondary focus:text-secondary"
								placeholder="전화번호"
								{...register("phone", { required: true })}
							/>
							<button className="btn-secondary btn text-white" type="button">
								인증
							</button>
						</div>
						{errors.phone?.type === "required" && (
							<p role="alert" className="text-error">
								전화번호를 입력하세요.
							</p>
						)}
					</div>
				</div>
				<div className="form-control w-full text-[18px]">
					<div className="flex flex-col items-start gap-4">
						<label className="text-base font-bold text-text-primary">
							성별
						</label>
						<div className="grid grid-cols-3 gap-x-10 gap-y-4">
							{genderOptions?.map(({ label, ...rest }) => (
								<div key={rest.value}>
									<label className="flex cursor-pointer gap-x-2">
										<input
											type="radio"
											className="radio checked:bg-secondary"
											{...rest}
											{...register("gender", { required: true })}
										/>
										<span className="text-base">{label}</span>
									</label>
								</div>
							))}
						</div>
					</div>
					{errors.gender?.type === "required" && (
						<p role="alert" className="text-error">
							성별을 선택하세요.
						</p>
					)}
				</div>
				<div className="form-control w-full text-[18px]">
					<div className="flex flex-col items-start gap-4">
						<label className="text-base font-bold text-text-primary">
							연령대
						</label>
						<div className="grid grid-cols-3 gap-x-10 gap-y-4">
							{ageOptions?.map(({ label, ...rest }) => (
								<div key={rest.value}>
									<label className="flex cursor-pointer gap-x-2">
										<input
											type="radio"
											className="radio checked:bg-secondary"
											{...rest}
											{...register("age", { required: true })}
										/>
										<span className="text-base">{label}</span>
									</label>
								</div>
							))}
						</div>
					</div>
					{errors.age?.type === "required" && (
						<p role="alert" className="text-error">
							연령대를 선택하세요.
						</p>
					)}
				</div>
				<Button className="btn-secondary mt-auto">참여하기</Button>
			</form>
		</Modal>
	);
}
