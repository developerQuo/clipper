import { OpenAI as OpenAiLangchain } from '@langchain/openai';
import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('Missing OpenAI Credentials');
}

export const openaiLangchain = new OpenAiLangchain({
	temperature: 0,
});

export const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});
