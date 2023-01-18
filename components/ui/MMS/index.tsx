import React from "react";
import { useForm } from "react-hook-form";
import { useRecoilValue } from "recoil";
import { csvState, CSVType } from "../../../store/recoilState";
import Button from "../Button";

const MESSAGE =
	"[Web 발신]\n[이태원 정형외과]\n저희 이태원 정형외과를 방문해주셔서 감사합니다. \n\n더 나은 서비스를 제공하고자 만족도 조사를 실시하고 있습니다. \n\n여러분의 소중한 의견과 많은 참여 바랍니다. 감사합니다. \n\n만족도 조사 참여 \n{구글폼 URL}";

export interface IForm {
	message: string;
	csvData: CSVType[];
}

export default function MMS() {
	const csvData = useRecoilValue(csvState);
	const { register, handleSubmit, getValues } = useForm<IForm>();

	const handleSendMMS = () => {
		const message = getValues("message");
		console.log(message, csvData);
	};

	return (
		<>
			<div className="mb-4">
				<div className="flex justify-center">
					<h2 className="text-3xl font-bold">MMS 발송</h2>
				</div>
			</div>
			<form onSubmit={handleSubmit(handleSendMMS)} className="px-12">
				<div className="space-y-2">
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
				<Button className="btn-primary btn mt-12 h-[56px] max-w-xs text-text-light-primary">
					MMS 발송
				</Button>
			</form>
		</>
	);
}
