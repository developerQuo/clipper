import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';
import {
	CONDENSE_PROMPT as DEFAULT_CONDENSE_PROMPT,
	QA_PROMPT as DEFAULT_QA_PROMPT,
} from '@/config/prompt';
import { ChatOpenAI } from 'langchain/chat_models';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(DEFAULT_CONDENSE_PROMPT);

const QA_PROMPT = PromptTemplate.fromTemplate(DEFAULT_QA_PROMPT);

export const makeChain = (
	// vectorstore: PineconeStore,
	onTokenStream?: (token: string) => void,
) => {
	// const questionGenerator = new LLMChain({
	// 	llm: new OpenAIChat({
	// 		temperature: 0,
	// 		modelName: 'gpt-4',
	// 	}),
	// 	prompt: CONDENSE_PROMPT,
	// });
	const chat = new ChatOpenAI({
		temperature: 0.3,
		modelName: 'gpt-4', //change this to older versions if you don't have access to gpt-4
		// streaming: Boolean(onTokenStream),
		// callbackManager: onTokenStream
		// 	? CallbackManager.fromHandlers({
		// 			async handleLLMNewToken(token) {
		// 				onTokenStream(token);
		// 				console.log(token);
		// 			},
		// 			async handleLLMError(err: Error) {
		// 				console.error(err);
		// 			},
		// 	  })
		// 	: undefined,
	});
	const chain = new LLMChain({
		prompt: QA_PROMPT,
		llm: chat,
	});
	return chain;
	// const docChain = loadQAChain(
	// 	new OpenAIChat({
	// 		temperature: 0,
	// 		modelName: 'gpt-4-32k', //change this to older versions if you don't have access to gpt-4
	// 		streaming: Boolean(onTokenStream),
	// 		callbackManager: onTokenStream
	// 			? CallbackManager.fromHandlers({
	// 					async handleLLMNewToken(token) {
	// 						onTokenStream(token);
	// 						console.log(token);
	// 					},
	// 					async handleLLMError(err: Error) {
	// 						console.error(err);
	// 					},
	// 			  })
	// 			: undefined,
	// 	}),
	// 	{ prompt: QA_PROMPT },
	// );
	// return docChain;

	// return new ChatVectorDBQAChain({
	// 	vectorstore,
	// 	combineDocumentsChain: docChain,
	// 	questionGeneratorChain: questionGenerator,
	// 	returnSourceDocuments: true,
	// 	k: 2, //number of source documents to return
	// });
};
