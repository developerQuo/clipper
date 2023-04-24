import { OpenAI } from 'langchain/llms';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';
import {
	CONDENSE_PROMPT as DEFAULT_CONDENSE_PROMPT,
	QA_PROMPT as DEFAULT_QA_PROMPT,
} from '@/config/prompt';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(DEFAULT_CONDENSE_PROMPT);

const QA_PROMPT = PromptTemplate.fromTemplate(DEFAULT_QA_PROMPT);

export const makeChain = (
	vectorstore: PineconeStore,
	onTokenStream?: (token: string) => void,
) => {
	const model = new OpenAI({
		temperature: 0.3,
		modelName: 'gpt-3.5-turbo', //change this to older versions if you don't have access to gpt-4
		cache: true,
		streaming: Boolean(onTokenStream),
		callbackManager: onTokenStream
			? CallbackManager.fromHandlers({
					async handleLLMNewToken(token) {
						onTokenStream(token);
						// console.log(token);
					},
					async handleLLMError(err: Error) {
						console.error(err);
					},
			  })
			: undefined,
	});

	return ConversationalRetrievalQAChain.fromLLM(
		model,
		vectorstore.asRetriever(5),
		{
			qaTemplate: DEFAULT_QA_PROMPT,
			questionGeneratorTemplate: DEFAULT_CONDENSE_PROMPT,
			returnSourceDocuments: true, //The number of source documents returned is 4 by default
		},
	);
};
