import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import NotificationContext from "../../../store/notification-context";
import {
	ReportOutput,
	ReportOutputState,
	SubKeywrodOutput,
} from "../../../store/report";
import Button from "../Button";
import { mainCategoryOptions, middleCategoryOptions } from "./data";

const TITLE = "스크립트 생성";
const FUNC_TITLE = "세부 키워드 생성";

export interface IForm {
	// 대분류
	mainCategory: string;
	// 중분류
	middleCategory: string;
	// 소분류
	subCategory: Array<string>;
	script: string;
}

export default function Form() {
	const notificationCtx = useContext(NotificationContext);
	const setResult = useSetRecoilState<ReportOutput>(ReportOutputState);
	const {
		register,
		handleSubmit,
		formState: { isValid },
		watch,
		setValue,
	} = useForm<IForm>({
		defaultValues: { mainCategory: mainCategoryOptions[0], subCategory: [] },
	});
	const watchMainCategory = watch("mainCategory");
	const watchMiddleCategory = watch("middleCategory");
	const watchSubCategory = watch("subCategory");

	const [subCategoryOptions, setSubCategoryOptions] = useState<
		string[] | undefined
	>(undefined);
	const onSubmit = ({ script }: IForm) => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "리포트 생성중...",
			status: "pending",
		});
		fetch("/api/test/report", {
			method: "POST",
			body: JSON.stringify({ script }),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data) => {
					throw new Error(`${TITLE}을 실패하였습니다. \n${data}`);
				});
			})
			.then((data: ReportOutput) => {
				notificationCtx.showNotification({
					title: "성공!",
					message: `${TITLE}을 완료되었습니다.`,
					status: "success",
				});
				setResult(data);
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
		const script = `		citing some of articles, make a analysis report. 
		The category of the report is ${watchMainCategory ?? ""} > ${
			watchMiddleCategory ?? ""
		} > ${watchSubCategory?.join(", ") ?? ""}.
		please write report in a JSON format.
		Do not use any special characters or symbols.
		Example: {
			"introduction": {introduction of the report},
			"body": {body of the report},
			"conclusion": {conclusion of the report},
			"cited_web_source": {cited web source of the report}
		}
		
		the report's outline is as follows:
		introduction
			- Briefly introduce the topic of your report and provide background information.
			- State the purpose of your report and what you hope to achieve.
			- 500 characters or less
		body
			- Describe the cited articles in detail.
			- Provide your own analysis and insights.
		conclusion
			- Provide your own insights to readers.
			- Suggest how to act in the future.
		cited web source
			- Provide a list of cited web source(title, url).`;
		setValue("script", script);
	}, [setValue, watchMainCategory, watchMiddleCategory, watchSubCategory]);

	useEffect(() => {
		if (watchMainCategory) setValue("middleCategory", "");
	}, [watchMainCategory, setValue]);

	const onChangeMiddleCategory = useCallback(
		(event: any) => {
			setSubCategoryOptions(undefined);
			setValue("subCategory", []);
			notificationCtx.showNotification({
				title: "로딩중...",
				message: "키워드 생성중...",
				status: "pending",
			});
			fetch("/api/test/subkeyword", {
				method: "POST",
				body: JSON.stringify({
					mainCategory: watchMainCategory,
					middleCategory: event.target.value,
				}),
				headers: {
					"Content-Type": "application/json",
				},
			})
				.then((res) => {
					if (res.ok) {
						return res.json();
					}

					return res.json().then(() => {
						throw new Error(`${FUNC_TITLE}을 실패하였습니다.`);
					});
				})
				.then((data: SubKeywrodOutput) => {
					notificationCtx.showNotification({
						title: "성공!",
						message: `${FUNC_TITLE}을 완료되었습니다.`,
						status: "success",
					});
					setSubCategoryOptions(data);
				})
				.catch((error) => {
					notificationCtx.showNotification({
						title: "실패!",
						message: error.message,
						status: "error",
					});
				});
		},
		[notificationCtx, setValue, watchMainCategory],
	);
	return (
		<form
			className="form-control flex w-full flex-col items-center gap-y-8 md:gap-y-[48px]"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						대분류
					</label>
					<select
						className="select-bordered select w-full focus:border-secondary focus:text-secondary"
						placeholder="대분류를 선택하세요."
						{...register("mainCategory")}
					>
						{mainCategoryOptions.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						중분류
					</label>
					<select
						className="select-bordered select w-full focus:border-secondary focus:text-secondary"
						placeholder="중분류를 선택하세요."
						{...register("middleCategory", {
							onChange: onChangeMiddleCategory,
						})}
					>
						{middleCategoryOptions[watchMainCategory]?.map((option) => (
							<option key={`${watchMainCategory}-${option}`} value={option}>
								{option}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						소분류
					</label>
					<div className="flex w-full flex-wrap gap-x-8">
						{subCategoryOptions?.map((option) => (
							<label key={option} className="label cursor-pointer space-x-3">
								<span className="label-text">{option}</span>
								<input
									type="checkbox"
									value={option}
									className="checkbox-secondary checkbox"
									{...register("subCategory")}
								/>
							</label>
						))}
					</div>
				</div>
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						스크립트
					</label>
					<textarea
						className="textarea-bordered textarea h-[500px] w-full focus:border-secondary focus:text-secondary"
						placeholder="스크립트를 입력해주세요."
						{...register("script")}
					/>
				</div>
			</div>
			<Button
				className="btn-primary h-[56px] max-w-xs text-text-light-primary"
				disabled={!isValid}
			>
				생성하기
			</Button>
		</form>
	);
}
