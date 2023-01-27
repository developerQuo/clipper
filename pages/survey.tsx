import { useRouter } from "next/router";
import React from "react";
import Form, { IForm } from "../components/ui/survey/Form";

export default function Survey() {
	const router = useRouter();
	const { name } = router.query as Pick<IForm, "name">;
	return (
		<div className="mx-auto min-w-[360px] max-w-screen-sm">
			<div className="flex flex-col items-center justify-center gap-y-8">
				<h1 className="text-3xl font-bold">방문 후기 설문 조사</h1>
				<h2 className="text-xl font-semibold text-text-secondary">
					{name}님, 진료 만족도에 대해 별점으로 알려주세요.
				</h2>
			</div>
			<div className="mt-20">
				<Form />
			</div>
		</div>
	);
}
