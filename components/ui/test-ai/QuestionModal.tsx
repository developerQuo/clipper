import { useCallback, useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRecoilState } from "recoil";
import NotificationContext from "../../../store/notification-context";
import {
	QuestionOutput,
	QuestionOutputState,
	SubKeywrodInput,
} from "../../../store/report";

export interface IForm {
	script: string;
}

type InputProps =
	| SubKeywrodInput & {
			subCategory: string[];
	  };

export default function QuestionModal({
	mainCategory,
	middleCategory,
	subCategory,
}: InputProps) {
	const notificationCtx = useContext(NotificationContext);
	const [question, setQuestion] =
		useRecoilState<QuestionOutput>(QuestionOutputState);

	const { register, handleSubmit, setValue } = useForm<IForm>();

	const onSubmit = useCallback(
		({ script }: IForm) => {
			const FUNC_TITLE = "질문 생성";
			notificationCtx.showNotification({
				title: "로딩중...",
				message: "키워드 기반 질문 생성중...",
				status: "pending",
			});
			fetch("/api/test/question", {
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
						console.log(data);
						throw new Error(`${FUNC_TITLE}을 실패하였습니다.`);
					});
				})
				.then((data: QuestionOutput) => {
					notificationCtx.showNotification({
						title: "성공!",
						message: `${FUNC_TITLE}을 완료되었습니다.`,
						status: "success",
					});
					setQuestion(data);
				})
				.catch((error) => {
					notificationCtx.showNotification({
						title: "실패!",
						message: error.message,
						status: "error",
					});
				});
		},
		[notificationCtx, setQuestion],
	);

	useEffect(() => {
		const script = `Recommend me 10 questions or topics you can learn based on category ${mainCategory} > ${middleCategory} > ${subCategory}?`;
		setValue("script", script);
	}, [mainCategory, middleCategory, setValue, subCategory]);

	return (
		<>
			<input
				type="checkbox"
				id="question-modal"
				className="modal-toggle"
				onChange={() => setQuestion(undefined)}
			/>
			<label htmlFor="question-modal" className="modal cursor-pointer">
				<label className="modal-box relative" htmlFor="">
					<form
						className="form-control flex w-full flex-col items-center gap-4"
						onSubmit={handleSubmit(onSubmit)}
					>
						<div className="form-control w-full">
							<div className="flex flex-col items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									스크립트
								</label>
								<textarea
									className="textarea-bordered textarea h-[200px] w-full focus:border-secondary focus:text-secondary"
									placeholder="스크립트를 입력해주세요."
									{...register("script")}
								/>
							</div>
						</div>
						<button className="btn-primary btn ml-auto">생성</button>
					</form>
					<div className="mt-8">
						<h3 className="text-center text-lg font-bold">
							키워드 기반 질문 목록
						</h3>
						<div className="mt-8 space-y-4">
							{question?.map((question, index) => (
								<div key={index} className="flex items-center gap-4">
									<div className="min-w-[2rem] text-right text-sm font-bold">
										Q{index + 1}.
									</div>
									<div className="text-text-secondary">{question}</div>
								</div>
							))}
						</div>
					</div>
				</label>
			</label>
		</>
	);
}

{
	/* <div className="my-20 mx-12 flex flex-col space-y-4">
<div className="mx-auto font-semibold">Loading...</div>
<progress className="progress w-full"></progress>
</div> */
}
