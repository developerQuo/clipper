import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';

export const makeChain = (
	vectorstore: PineconeStore,
	condensePrompt: string,
	qaPrompt: string,
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
			temperature: 0,
			modelName: 'gpt-4', //change this to older versions if you don't have access to gpt-4
			streaming: Boolean(onTokenStream),
			callbackManager: onTokenStream
				? CallbackManager.fromHandlers({
						async handleLLMNewToken(token) {
							onTokenStream(token);
							console.log(token);
						},
				  })
				: undefined,
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
