import { OpenAI } from '@langchain/openai';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { PineconeStore } from '@langchain/pinecone';
import { CallbackManager } from 'langchain/callbacks';
import { CONDENSE_PROMPT, QA_PROMPT } from '@/config/prompt';

export const makeChain = (
	vectorstore: PineconeStore,
	onTokenStream?: (token: string) => void,
) => {
	const model = new OpenAI({
		temperature: 0.0,
		modelName: 'gpt-4', //change this to older versions if you don't have access to gpt-4
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
			qaTemplate: QA_PROMPT,
			questionGeneratorTemplate: CONDENSE_PROMPT,
			returnSourceDocuments: true, //The number of source documents returned is 4 by default
		},
	);
};
