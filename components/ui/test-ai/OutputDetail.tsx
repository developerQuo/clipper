import { ReportOutput } from "../../../store/report";

type InputProps = NonNullable<ReportOutput>;

export default function OutputDetail({
	introduction,
	body,
	conclusion,
	cited_web_source,
}: InputProps) {
	return (
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
	);
}
