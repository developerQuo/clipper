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
				<span>{today_summary}</span>
			</div>
			<div>
				<span>{report}</span>
			</div>
			<div>
				<span>{insight}</span>
			</div>
			<div className="text-base">
				<span className="block text-2xl font-bold">Cited Web Source</span>
				{Array.isArray(cited_web_source) ? (
					cited_web_source.map((source, index) => (
						<div key={source.url} className="my-2">
							<div>
								<span className="font-semibold">{source.title}</span>{" "}
								<span className="text-text-secondary">
									published by {source.date}
								</span>
							</div>
							<div className="text-text-secondary">{source.url}</div>
						</div>
					))
				) : (
					<div key={(cited_web_source as any).url}>
						<div>
							<span className="font-semibold">
								{(cited_web_source as any).title}
							</span>{" "}
							<span className="text-text-secondary">
								published by {(cited_web_source as any).date}
							</span>
						</div>
						<div className="text-text-secondary">
							{(cited_web_source as any).url}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
