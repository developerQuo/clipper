import { GetServerSideProps } from "next";
import { useRecoilValue } from "recoil";
import { ReportOutput, ReportOutputState } from "../../../store/report";

export default function Output() {
	const { introduction, body, conclusion, cited_web_source } =
		useRecoilValue<ReportOutput>(ReportOutputState) ?? {};
	return (
		<>
			<h1 className="text-3xl font-bold">결과물 출력</h1>
			<div className="space-y-4 text-lg">
				<div>
					<span className="block text-2xl font-bold">Introduction</span>
					<span>{introduction}</span>
				</div>
				<div>
					<span className="block text-2xl font-bold">Body</span>
					<span>{body}</span>
				</div>
				<div>
					<span className="block text-2xl font-bold">Conclusion</span>
					<span>{conclusion}</span>
				</div>
				<div className="text-base">
					<span className="block text-2xl font-bold">Cited Web Source</span>
					{cited_web_source?.map((source, index) => (
						<div key={index}>
							<div>{source.title}</div>
							<div className="text-text-secondary">{source.url}</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	return { props: {} };
};
