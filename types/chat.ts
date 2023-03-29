import { Document } from 'langchain/document';

export type Message = {
	type: 'apiMessage' | 'userMessage';
	message: string;
	isStreaming?: boolean;
	sourceDocs?: Document[];
};

export type ChatInput = { question: string; history: [string, string][] };
