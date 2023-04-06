import { Document } from 'langchain/document';

export type Message = {
	type: 'apiMessage' | 'userMessage';
	message: string;
	isStreaming?: boolean;
	sourceDocs?: Document[];
};

export type ChatInput = { question: string; history: [string, string][] };

export type ChatOptionInput = {
	temperature?: number;
	top_p?: number;
	n?: number;
	presence_penalty?: number;
	frequency_penalty?: number;
	model: string;
};
