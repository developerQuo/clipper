import { OpenAI } from 'langchain/llms';
import { Configuration, OpenAIApi } from 'openai';

if (!process.env.OPENAI_API_KEY) {
	throw new Error('Missing OpenAI Credentials');
}

export const openaiLangchain = new OpenAI({
	temperature: 0,
});

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});
export const openai = new OpenAIApi(configuration);
