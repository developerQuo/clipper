type InputProps = {
	summary: string;
	faq: string[];
	askQuestion: (e: any, value?: string) => void;
};

export default function Introduce({ summary, faq, askQuestion }: InputProps) {
	return (
		<>
			<div className="text-sm leading-6">{summary}</div>
			<div className="mb-8 mt-6 flex flex-col space-y-2 text-sm">
				<span className="text-base font-extrabold">
					Check out and click the main topics below:
				</span>
				{faq?.map((q, index) => (
					<button
						key={`faq-${index}`}
						className="btn-outline btn-sm btn w-fit rounded-3xl px-4 text-xs font-medium"
						onClick={(e) => {
							const val = (e.target as any).textContent;
							askQuestion(e, val);
						}}
					>
						{q}
					</button>
				))}
			</div>
		</>
	);
}
