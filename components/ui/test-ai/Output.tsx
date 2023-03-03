import { GetServerSideProps } from "next";
import { useContext, useState } from "react";
import { useRecoilValue } from "recoil";
import NotificationContext from "../../../store/notification-context";
import { ReportOutput, ReportOutputState } from "../../../store/report";
import OutputDetail from "./OutputDetail";

export default function Output() {
	const en = useRecoilValue<ReportOutput>(ReportOutputState);
	const [ko, setKo] = useState<ReportOutput | null>(null);

	const notificationCtx = useContext(NotificationContext);
	const translate = () => {
		const TITLE = "한글 번역";
		notificationCtx.showNotification({
			title: "로딩중...",
			message: "리포트 생성중...",
			status: "pending",
		});
		fetch("/api/test/translate", {
			method: "POST",
			body: JSON.stringify(en),
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
				setKo(data);
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
		<>
			<h1 className="text-3xl font-bold">결과물 출력</h1>
			{en && <OutputDetail {...en} />}
			<button
				className="btn-secondary btn self-end"
				onClick={translate}
				disabled={!en}
			>
				한글 번역
			</button>
			{ko && <OutputDetail {...ko} />}
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return { props: {} };
};
