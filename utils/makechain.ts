import { OpenAIChat } from 'langchain/llms';
import { LLMChain, ChatVectorDBQAChain, loadQAChain } from 'langchain/chains';
import { PineconeStore } from 'langchain/vectorstores';
import { PromptTemplate } from 'langchain/prompts';
import { CallbackManager } from 'langchain/callbacks';

const CONDENSE_PROMPT = PromptTemplate.fromTemplate(`
	I give you a Chat History of someone and me chatting.
	New Question is the next question following the chat history.
	Please create a new "Standalone Question" that combines chat history and new questions.
	Please reply in korean.
	Chat History: {chat_history}
	New Question: {question}
`);

const QA_PROMPT = PromptTemplate.fromTemplate(
	`I give you my question and the document.
	You should only reply that reference the document below.
	Generation of unreferenced answers is prohibited.
	If you can't find the answer in the document below, just say "Hmm, I'm not sure."
	Don't make up hyperlinks.
	Please reply in language used in the question.
	Question: {question}
	Document: {context}`,
);

export const makeChain = (
	vectorstore: PineconeStore,
	onTokenStream?: (token: string) => void,
) => {
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
