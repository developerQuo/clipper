import ChatDoc from '@/components/ui/chat/gpt4-test';
import { Textarea } from '@/components/ui/TextArea';
import Link from 'next/link';
import { useState } from 'react';

export default function Drawer() {
	const [systemMessage, setSystemMessage] = useState<string | undefined>();
	return (
		<div className="space-y-24">
			<div className="form-control items-start gap-4">
				<label className="space-x-6 text-lg font-bold text-text-primary">
					<span>System message</span>
					<Link
						href="https://platform.openai.com/docs/guides/chat/instructing-chat-models"
						className="text-sm text-text-secondary"
					>
						Ref. Instructing chat models
					</Link>
				</label>
				<Textarea
					className="textarea-bordered textarea h-[16rem] focus:border-secondary focus:text-secondary"
					value={systemMessage}
					onChange={(e: any) => setSystemMessage(e.target.value)}
				/>
			</div>
			<ChatDoc systemMessage={systemMessage} />
		</div>
	);
}
