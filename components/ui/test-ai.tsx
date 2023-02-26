import Form from "./test-ai/Form";
import Output from "./test-ai/Output";

export default function TestAI() {
	return (
		<div className="flex flex-col items-center space-y-20 py-12">
			<h1 className="text-3xl font-bold">Test AI Report</h1>
			<Form />
			<Output />
		</div>
	);
}
