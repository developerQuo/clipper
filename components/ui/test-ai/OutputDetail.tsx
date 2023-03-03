import { ReportOutput } from "../../../store/report";

type InputProps = NonNullable<ReportOutput>;

export default function OutputDetail({
	today_summary,
	report,
	insight,
	cited_web_source,
}: InputProps) {
	return (
		<div className="space-y-4 text-lg">
			<div>
				<span className="block text-2xl font-bold">Today&apos;s Summary</span>
				<span>{today_summary}</span>
			</div>
			<div>
				<span className="block text-2xl font-bold">Report</span>
				<span>{report}</span>
			</div>
			<div>
				<span className="block text-2xl font-bold">Insight</span>
				<span>{insight}</span>
			</div>
			<div className="text-base">
				<span className="block text-2xl font-bold">Cited Web Source</span>
				{cited_web_source?.map((source, index) => (
					<div key={source.url}>
						<div>{source.title}</div>
						<div className="text-text-secondary">{source.url}</div>
					</div>
				))}
			</div>
		</div>
	);
}
