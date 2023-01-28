/* 설문조사 폼 */

import { AppInitialProps } from "next/app";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import NotificationContext from "../../../store/notification-context";
import Button from "../Button";
import { ApiResponseType } from "../types";

const TITLE = "설문조사 제출";

export interface IForm {
	name: string;
	phone: string;
	rating: string;
	description?: string;
	// 방문일
	datetime: string;
}

export default function Form() {
	const router = useRouter();
	const { name, phone, datetime } = router.query as Pick<
		IForm,
		"name" | "phone" | "datetime"
	>;

	const notificationCtx = useContext(NotificationContext);
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
		setValue,
	} = useForm<IForm>({
		defaultValues: {
			name,
			phone,
			datetime,
		},
	});

	const onSubmit = (data: IForm) => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});
		fetch("/api/mms/form-save", {
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
					throw new Error(`${TITLE}을 실패하였습니다.`);
				});
			})
			.then((data: ApiResponseType) => {
				notificationCtx.showNotification({
					title: "성공!",
					message: `${TITLE}을 완료되었습니다.`,
					status: "success",
				});

				router.push("/survey-complete");
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: "실패!",
					message: error.message,
					status: "error",
				});
			});
	};

	useEffect(() => {
		setValue("name", name);
		setValue("phone", phone);
		setValue("datetime", datetime);
	}, [name, phone, datetime, setValue]);

	return (
		<form
			className="form-control flex flex-col items-center gap-y-8 md:gap-y-[92px]"
			onSubmit={handleSubmit(onSubmit)}
		>
			<input hidden {...register("name", { required: true })} />
			<input hidden {...register("phone", { required: true })} />
			<input hidden {...register("datetime", { required: true })} />
			<div className="form-control w-full items-start gap-4 text-[18px]">
				<label className="text-base font-bold text-text-primary">만족도</label>
				<div className="rating rating-lg rating-half">
					<input type="radio" name="rating" className="rating-hidden" />
					{/* {[...Array(10)].map((_, i) => (
						<input
							key={i}
							type="radio"
							className={`mask-half-${
								i % 2 ? "2" : "1"
							} mask mask-star-2 bg-orange-400`}
							value={(i + 1) / 2}
							defaultChecked={i === 5}
							{...register("rating", {
								required: "만족도를 선택하세요.",
							})}
						/>
					))} */}

					<input
						type="radio"
						className={`mask mask-half-1 mask-star-2 bg-orange-400`}
						value={1 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-2 mask-star-2 bg-orange-400`}
						value={2 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-1 mask-star-2 bg-orange-400`}
						value={3 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-2 mask-star-2 bg-orange-400`}
						value={4 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-1 mask-star-2 bg-orange-400`}
						value={5 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-2 mask-star-2 bg-orange-400`}
						value={6 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-1 mask-star-2 bg-orange-400`}
						value={7 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-2 mask-star-2 bg-orange-400`}
						value={8 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-1 mask-star-2 bg-orange-400`}
						value={9 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
					<input
						type="radio"
						className={`mask mask-half-2 mask-star-2 bg-orange-400`}
						value={10 / 2}
						{...register("rating", {
							required: "만족도를 선택하세요.",
						})}
					/>
				</div>
				{errors.rating?.type === "required" && (
					<p role="alert" className="text-error">
						{errors.rating.message}
					</p>
				)}
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						추가 의견
					</label>
					<textarea
						className="textarea-bordered textarea h-[200px] w-full focus:border-secondary focus:text-secondary"
						placeholder="추가 의견을 입력해주세요. (선택)"
						{...register("description")}
					/>
				</div>
			</div>
			<Button
				className="btn-primary h-[56px] max-w-xs text-text-light-primary"
				disabled={!isValid}
			>
				제출하기
			</Button>
		</form>
	);
}
