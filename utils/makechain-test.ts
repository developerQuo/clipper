import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
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

	const questionGenerator = new LLMChain({
		llm: new OpenAIChat({ temperature: 0 }),
		prompt: CONDENSE_PROMPT,
	});
	const docChain = loadQAChain(
		new OpenAIChat({
			streaming: Boolean(onTokenStream),
			callbackManager: onTokenStream
				? CallbackManager.fromHandlers({
						async handleLLMNewToken(token) {
							onTokenStream(token);
							console.log(token);
						},
				  })
				: undefined,
			...chatOptions,
		}),
		{ prompt: QA_PROMPT },
	);

	return new ChatVectorDBQAChain({
		vectorstore,
		combineDocumentsChain: docChain,
		questionGeneratorChain: questionGenerator,
		returnSourceDocuments: true,
		k: 2, //number of source documents to return
	});
};
