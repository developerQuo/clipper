import { Document } from 'langchain/document';

export type SourceDocs = { source: 'string'; page: number } & Omit<
	Document,
	'metadata'
>;

export type Message = {
	type: 'apiMessage' | 'userMessage';
	message: string;
	isStreaming?: boolean;
	sourceDocs?: SourceDocs[];
};

export type MessageState = {
	messages: Message[];
	history: [string, string][];
	pendingSourceDocs?: SourceDocs[];
	pending?: string;
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
