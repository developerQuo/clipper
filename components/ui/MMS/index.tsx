import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";
import NotificationContext from "../../../store/notification-context";
import { csvState, CSVType } from "../../../store/recoilState";
import Button from "../Button";
import { ApiResponseType } from "../types";

const TITLE = "MMS 발송";
const MESSAGE =
	"[Web 발신]\n[이태원 정형외과]\n저희 이태원 정형외과를 방문해주셔서 감사합니다. \n\n더 나은 서비스를 제공하고자 만족도 조사를 실시하고 있습니다. \n\n여러분의 소중한 의견과 많은 참여 바랍니다. 감사합니다. \n\n만족도 조사 참여 \n[form url]";

export interface IForm {
	message: string;
	csvData: CSVType[];
}

export default function MMS() {
	const csvData = useRecoilValue(csvState);
	const { register, handleSubmit, getValues } = useForm<IForm>();
	const notificationCtx = useContext(NotificationContext);

	const handleSendMMS = () => {
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "",
			status: "pending",
		});

		const message = getValues("message");
		const data = { message, csvData };

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
		<div className="space-y-12">
			<div className="flex justify-center">
				<h2 className="text-3xl font-bold">MMS 발송</h2>
			</div>
			<form
				onSubmit={handleSubmit(handleSendMMS)}
				className="flex flex-col items-center px-12"
			>
				<div className="w-full space-y-2">
					<label className="text-base font-bold text-text-primary">
						MMS Message
					</label>
					<textarea
						className="textarea-bordered textarea w-full"
						defaultValue={MESSAGE}
						rows={10}
						{...register("message")}
					/>
				</div>
				<Button className="btn-primary mt-12 h-[56px] max-w-xs text-text-light-primary">
					MMS 발송
				</Button>
			</form>
		</div>
	);
}
