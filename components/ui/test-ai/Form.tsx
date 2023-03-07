import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSetRecoilState } from "recoil";
import NotificationContext from "../../../store/notification-context";
import {
	ReportOutput,
	ReportOutputState,
	TestSubKeywordOutput,
} from "../../../store/report";
import Button from "../Button";
import { mainCategoryOptions, middleCategoryOptions } from "./data";
import QuestionModal from "./QuestionModal";

const TITLE = "스크립트 생성";

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
		I'm going to publish an ${watchMainCategory ?? ""} report.
		I want the report to include some of [${
			middleCategoryOptions[watchMainCategory]
		}].
		For some of them, the latest content of the citing site is the selection criterion.
		please write report in a JSON format.
		Do not use any special characters or symbols.
		Example: {
			"today_summary": {summary of the report},
			"report": {report of the report},
			"insight": {insight of the report},
			"cited_web_source": Array<{ 
				"title": {title of cited web source of the report}; 
				"url": { url of cited web source of the report}; 
				"date": { date of cited web source of the report} }>
		}
		
		the report's outline is as follows:
		today_summary
			- Randomly select a date between 2019 and 2021 and summarize the major ${
				watchMainCategory ?? ""
			} articles on that date, news published on that day in an easy-to-understand way to those who study ${
			watchMainCategory ?? ""
		}.
			- Summarize the important ${
				watchMainCategory ?? ""
			} news you have gathered in 300 to 600 characters.
			- Specific terms and numbers are important in this report, so please include them when summarizing them as much as possible.
		report
			- Write the articles, news, and reports you want to reflect in detail by dividing them into titles and descriptions.
			- It is necessary to explain as accurately and clearly as possible to those who need to study ${
				watchMainCategory ?? ""
			}.
			- The number of characters must be 800 to 1500 characters.
		insight
			- Provide your own insights to readers.
			- When referring to the report, the year, month, and day were indicated as to which date was specified.
		cited web source.
			- Provide a list of cited web source(title, url).
			- Show selected date.`;
		setValue("script", script);
	}, [setValue, watchMainCategory, watchMiddleCategory, watchSubCategory]);

	useEffect(() => {
		if (watchMainCategory) setValue("middleCategory", "");
	}, [watchMainCategory, setValue]);

	const generateKeyword = useCallback(
		(event: any) => {
			const FUNC_TITLE = "세부 키워드 생성";
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
				.then((data: TestSubKeywordOutput) => {
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
		<>
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
				{/* <div className="form-control w-full">
					<div className="flex flex-col items-start gap-4">
						<label className="text-base font-bold text-text-primary">
							중분류
						</label>
						<select
							className="select-bordered select w-full focus:border-secondary focus:text-secondary"
							placeholder="중분류를 선택하세요."
							{...register("middleCategory", {
								onChange: generateKeyword,
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
						<div className="flex w-full items-center">
							<label className="text-base font-bold text-text-primary">
								소분류
							</label>
							<label
								htmlFor="question-modal"
								className="btn-secondary btn ml-auto"
								{...{ disabled: !watchSubCategory.length }}
							>
								질문 생성
							</label>
						</div>
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
				</div> */}
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
			<QuestionModal
				mainCategory={watchMainCategory}
				middleCategory={watchMiddleCategory}
				subCategory={watchSubCategory}
			/>
		</>
	);
}
