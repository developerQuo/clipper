import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { supabase } from '@/utils/supabase-client';
import { openai } from '@/utils/openai-client';
import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { IForm } from '../../generate';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { PineconeStore } from 'langchain/vectorstores';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { loadQAMapReduceChain } from 'langchain/chains';
import { OpenAI } from 'langchain';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	if (req.method !== 'POST') {
		return;
	}

	// get user id
	const session = await getSession({ req });
	const userId = session?.user?.id;

	const { prompt } = req.body as unknown as IForm;

	if (!userId || !prompt) {
		return res.status(400).json({ message: 'No question in the request' });
	}
	// esg or senior report
	// const refs = prompt.startsWith('우리 ')
	// 	? [183, 184, 185, 186]
	// 	: [179, 180, 181, 182];
	// const { data } = await supabase
	// 	.from('content')
	// 	.select('title,content')
	// 	.in('id', refs)
	// 	.is('file_type', 'null')

	// 	.not('content', 'is', 'null');

	const index = pinecone.Index(PINECONE_INDEX_NAME);

	// /* create vectorstore*/
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings(),
		{
			pineconeIndex: index,
			textKey: 'text',
			namespace: PINECONE_NAME_SPACE,
		},
	);
	try {
		const llm = new OpenAI({ modelName: 'gpt-3.5-turbo', temperature: 0.3 });
		const chain = loadQAMapReduceChain(llm);
		const documents = await vectorStore
			.asRetriever(3)
			.getRelevantDocuments(prompt);
		const normalizedDocuments = documents.map(({ pageContent }) => ({
			pageContent,
		}));
		console.log(normalizedDocuments);
		const result = await chain.call({
			input_documents: normalizedDocuments,
			question: `
			 			Create a 1000 korean characters new content that combined given the following documents.
			 			Choose 5 key topics and create 5 new contents that details.
			 			Please reply in Korean.

			 			Documents:
			 			{input_documents}

			 			Prompt:
			 			${prompt}

						Answer Structure Example(Hide this title): 
						- 5 key topics
						- 5 new contents for each topics
						- conclusion

			 			Answer in Markdown:`,
		});
		console.log(result);
		const response = result.text;
		// if (content) {
		// 	const len = content.length;
		// 	const documents = content
		// 		.map(({ title, content }) => `${title} - ${content}`)
		// 		.join('\n\n');
		// 	const chat = await openai.createChatCompletion({
		// 		model: 'gpt-3.5-turbo',
		// 		messages: [
		// 			{
		// 				role: ChatCompletionRequestMessageRoleEnum.System,
		// 				content: `I give you ${len} documents.
		// 			I want to create a 1700 characters new content that combines ${len} documents.
		// 			Choose 5 key topics and create 5 new contents that details.
		// 			Please reply in Korean.

		// 			Documents:
		// 			${documents}

		// 			Prompt:
		// 			${prompt}

		// 			Answer in Markdown:`,
		// 			},
		// 		],
		// 	});
		// 	const response = chat.data.choices[0].message?.content;

		res.status(200).json({ data: response });
		// }
	} catch (error) {
		console.log('error', error);
	}
}
