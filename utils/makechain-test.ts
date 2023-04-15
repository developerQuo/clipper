import { OpenAI, OpenAIChat } from 'langchain/llms';
import {
	LLMChain,
	ChatVectorDBQAChain,
	loadQAChain,
	ConversationalRetrievalQAChain,
} from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';
import { ChatOptionInput } from '@/types/chat';

export const makeChain = (
	vectorstore: PineconeStore,
	condensePrompt: string,
	qaPrompt: string,
	chatOptions: ChatOptionInput,
	onTokenStream?: (token: string) => void,
) => {
	const CONDENSE_PROMPT = PromptTemplate.fromTemplate(condensePrompt);

	const QA_PROMPT = PromptTemplate.fromTemplate(qaPrompt);
	const model = new OpenAI({
		temperature: 0, // increase temepreature to get more creative answers
		modelName: 'gpt-3.5-turbo', //change this to gpt-4 if you have access
		// 		streaming: Boolean(onTokenStream),
		// 		callbackManager: onTokenStream
		// 			? CallbackManager.fromHandlers({
		// 					async handleLLMNewToken(token) {
		// 						onTokenStream(token);
		// 						console.log(token);
		// 					},
		// 			  })
		// 			: undefined,
		// 		...chatOptions,
	});
	// const questionGenerator = new LLMChain({
	// 	llm: new OpenAIChat({ temperature: 0 }),
	// 	prompt: CONDENSE_PROMPT,
	// });
	// const docChain = loadQAChain(
	// 	new OpenAIChat({
	// 		streaming: Boolean(onTokenStream),
	// 		callbackManager: onTokenStream
	// 			? CallbackManager.fromHandlers({
	// 					async handleLLMNewToken(token) {
	// 						onTokenStream(token);
	// 						console.log(token);
	// 					},
	// 			  })
	// 			: undefined,
	// 		...chatOptions,
	// 	}),
	// 	{ prompt: QA_PROMPT },
	// );

	return ConversationalRetrievalQAChain.fromLLM(
		model,
		vectorstore.asRetriever(5),
		{
			qaTemplate: qaPrompt,
			questionGeneratorTemplate: condensePrompt,
			returnSourceDocuments: true, //The number of source documents returned is 4 by default
		},
	);
};
