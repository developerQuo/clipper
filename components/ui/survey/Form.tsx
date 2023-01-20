/* 설문조사 폼 */

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
	dateTime: string;
}

export default function Form() {
	const notificationCtx = useContext(NotificationContext);
	const {
		register,
		handleSubmit,
		formState: { isValid, errors },
	} = useForm<IForm>({
		defaultValues: {
			name: "김창민",
			phone: "010-4744-7289",
			dateTime: "2023-01-10 10:10",
		},
	});
	const router = useRouter();

	const onSubmit = (data: IForm) => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});

		fetch("/api/mms/send", {
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

	return (
		<form
			className="form-control gap-y-8 px-[24px] md:gap-y-[92px] lg:px-0"
			onSubmit={handleSubmit(onSubmit)}
		>
			<input
				hidden
				// className="input-bordered input w-full focus:border-secondary focus:text-secondary"
				{...register("name", { required: true })}
			/>
			<input
				hidden
				// className="input-bordered input w-full focus:border-secondary focus:text-secondary"
				{...register("phone", { required: true })}
			/>
			<div className="form-control w-full items-start gap-4 text-[18px]">
				<label className="text-base font-bold text-text-primary">만족도</label>
				<div className="rating rating-lg rating-half">
					<input type="radio" name="rating" className="rating-hidden" />
					{[...Array(10)].map((_, i) => (
						<input
							key={i}
							type="radio"
							className={`mask-half-${
								i % 2 ? "2" : "1"
							} mask mask-star-2 bg-orange-400`}
							value={(i + 1) / 2}
							defaultChecked={i === 4}
							{...register("rating", {
								required: "만족도를 선택하세요.",
							})}
						/>
					))}
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
			<Button className="btn-primary" disabled={!isValid}>
				제출하기
			</Button>
		</form>
	);
}
