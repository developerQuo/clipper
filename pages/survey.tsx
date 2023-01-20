import React from "react";
import Form from "../components/ui/survey/Form";

export default function Survey() {
	return (
		<div className="mx-auto min-w-[360px] max-w-screen-sm">
			<div className="flex justify-center">
				<h1 className="text-3xl font-bold">방문 후기 설문 조사</h1>
			</div>
			<div>
				<h2>{"name"}님, 진료 만족도에 대해 별점으로 알려주세요.</h2>
				<Form />
			</div>
		</div>
	);
}
