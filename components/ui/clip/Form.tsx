import { useRouter } from "next/router";
import { useCallback, useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { SubKeywordOutput } from "../../../store/clip";
import NotificationContext from "../../../store/notification-context";
import Button from "../Button";
import { OptionType } from "../types";

const SUBJECT = "클립";

export type SubTopicOptionType = { [key: string]: OptionType[] };

export interface IForm {
	id?: string;
	// 대분류
	mainTopic: string;
	mainTopicKo: string;
	// 중분류
	subTopic: string;
	// 소분류
	aiTopic: Array<string>;
	// clip's name
	name: string;
}

type InputProps = {
	mainTopicOptions: OptionType[];
	subTopicOptions: SubTopicOptionType;
	initialValues?: IForm;
	initialAiTopicOptions: SubKeywordOutput;
};

// TODO: clip 수정
// TODO: clip 숫자 제한
export default function Form({
	mainTopicOptions,
	subTopicOptions,
	initialValues,
	initialAiTopicOptions,
}: InputProps) {
	const ACTION = initialValues ? "수정" : "생성";
	const notificationCtx = useContext(NotificationContext);
	const router = useRouter();
	const {
		register,
		handleSubmit,
		formState: { isValid, dirtyFields, isDirty },
		watch,
		setValue,
		getValues,
		reset,
	} = useForm<IForm>({
		defaultValues: {
			mainTopic: mainTopicOptions[0].value as string,
			mainTopicKo: mainTopicOptions[0].label as string,
			aiTopic: [],
			...{ ...(initialValues || {}) },
		},
	});
	const watchMainTopic = watch("mainTopic");

	const onSubmit = ({ subTopic, aiTopic, name }: IForm) => {
		const TITLE = `${SUBJECT} ${ACTION}`;
		notificationCtx.showNotification({
			title: "로딩중...",
			message: `${TITLE}중...`,
			status: "pending",
		});
		const values = initialValues
			? {
					...(dirtyFields.subTopic ? { subTopic } : {}),
					...(dirtyFields.aiTopic ? { aiTopic } : {}),
					...(dirtyFields.name ? { name } : {}),
					...(dirtyFields.aiTopic
						? {
								aiTopicKo: aiTopic.map(
									(en) =>
										aiTopicOptions?.find(({ en: optionEn }) => en === optionEn)
											?.ko,
								),
						  }
						: {}),
					id: initialValues?.id,
			  }
			: {
					subTopic,
					aiTopic,
					aiTopicKo: aiTopic.map(
						(en) =>
							aiTopicOptions?.find(({ en: optionEn }) => en === optionEn)?.ko,
					),
					name,
			  };
		fetch(`/api/clip/${initialValues ? "update" : "create"}`, {
			method: "POST",
			body: JSON.stringify(values),
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
			.then(() => {
				notificationCtx.showNotification({
					title: "성공!",
					message: `${TITLE}을 완료되었습니다.`,
					status: "success",
				});
				router.push("/user/clip");
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: "실패!",
					message: error.message,
					status: "error",
				});
			});
	};

	const [aiTopicOptions, setAiTopicOptions] = useState<SubKeywordOutput>(
		initialAiTopicOptions,
	);

	useEffect(() => {
		if (watchMainTopic) setValue("subTopic", "");
	}, [watchMainTopic, setValue]);

	useEffect(() => {
		if (initialValues) {
			reset();
		}
	}, [initialValues, reset]);

	const generateKeyword = useCallback(
		(event: any) => {
			const FUNC_TITLE = "세부 키워드 생성";
			setAiTopicOptions(undefined);
			setValue("aiTopic", []);
			notificationCtx.showNotification({
				title: "로딩중...",
				message: "키워드 생성중...",
				status: "pending",
			});
			const mainTopicKo = getValues("mainTopicKo");
			const subTopicKo = event.target.options[event.target.selectedIndex].text;
			fetch("/api/clip/subkeyword", {
				method: "POST",
				body: JSON.stringify({
					mainTopicKo,
					subTopicKo,
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
				.then((data: SubKeywordOutput) => {
					notificationCtx.showNotification({
						title: "성공!",
						message: `${FUNC_TITLE}을 완료되었습니다.`,
						status: "success",
					});
					setAiTopicOptions([
						...(initialAiTopicOptions || []),
						...(data || []),
					]);
				})
				.catch((error) => {
					notificationCtx.showNotification({
						title: "실패!",
						message: error.message,
						status: "error",
					});
				});
		},
		[getValues, initialAiTopicOptions, notificationCtx, setValue],
	);
	return (
		<form
			className="form-control flex w-full flex-col items-center gap-y-8 md:gap-y-[48px]"
			onSubmit={handleSubmit((values) => onSubmit(values))}
		>
			<input hidden {...register("id")} />
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						대분류
					</label>
					<select
						className="select-bordered select w-full focus:border-secondary focus:text-secondary"
						placeholder="대분류를 선택하세요."
						{...register("mainTopic", {
							required: true,
							onChange(event) {
								setValue(
									"mainTopicKo",
									event.target.options[event.target.selectedIndex].text,
								);
							},
						})}
					>
						{mainTopicOptions.map(({ value, label }) => (
							<option key={value} value={value}>
								{label}
							</option>
						))}
					</select>
					<input hidden {...register("mainTopicKo")} />
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
						{...register("subTopic", {
							required: true,
							onChange: generateKeyword,
						})}
					>
						{subTopicOptions[watchMainTopic]?.map(({ value, label }) => (
							<option key={`${watchMainTopic}-${value}`} value={value}>
								{label}
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
					</div>
					<div className="flex w-full flex-wrap gap-x-8">
						{aiTopicOptions?.map(({ en, ko }) => (
							<label key={en} className="label cursor-pointer space-x-3">
								<span className="label-text">{`${en} (${ko})`}</span>
								<input
									type="checkbox"
									value={en}
									className="checkbox-secondary checkbox"
									{...register("aiTopic", { required: true })}
								/>
							</label>
						))}
					</div>
				</div>
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">
						클립 이름
					</label>
					<input
						className="input-bordered input w-full focus:border-secondary focus:text-secondary"
						placeholder="클립 이름을 입력하세요."
						{...register("name", {
							required: true,
						})}
					/>
				</div>
			</div>
			<Button
				className="btn-primary h-[56px] max-w-xs text-text-light-primary"
				disabled={!isValid || (initialValues && !isDirty)}
			>
				{ACTION}하기
			</Button>
		</form>
	);
}
