import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader, CheerioWebBaseLoader } from 'langchain/document_loaders';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
// import { supabase } from '@/utils/supabase-client';

export const run = async () => {
	try {
		/* Get the list of pdf files not uploaded vector_store from the pdf_meta table */
		// const { data: pdfMetaData, error: pdfMetaError } = await supabase
		// 	.from('pdf_meta')
		// 	.select('id,title,from,url')
		// 	.not('vector_upload', 'is', true);
		// if (pdfMetaError) {
		// 	throw new Error(pdfMetaError.message);
		// }
		// console.log(
		// 	'pdfMetaData',
		// 	pdfMetaData.map((d) => d.title),
		// );

		// /* Loop through the list of pdf files and upload the vector_store */
		// pdfMetaData?.forEach(async ({ id, title, from, url }) => {
		const { id, title, from, url } = {
			id: '1',
			title: '우크라이나 사태 이후 러시아의 대외경제 현황 및 대안정책 분석',
			from: 'kotra',
			url: 'https://dream.kotra.or.kr/kotranews/cms/indReport/actionIndReportDetail.do?SITE_NO=3&MENU_ID=280&CONTENTS_NO=1&pRptNo=13550&pHotClipTyName=DEEP',
		};
		// TODO: cloud file storage
		/*load raw docs from the pdf file in the directory */
		let loader: CheerioWebBaseLoader | PDFLoader = new PDFLoader(
			`docs/${from}/${title}.pdf`,
		);
		if (!loader) {
			loader = new CheerioWebBaseLoader(url);
		}
		const rawDocs = await loader.load();
		/* Split text into chunks */
		const textSplitter = new RecursiveCharacterTextSplitter({
			chunkSize: 1000,
			chunkOverlap: 200,
		});
		const docs = await textSplitter.splitDocuments(rawDocs);
		console.log('creating vector store...');
		/*create and store the embeddings in the vectorStore*/
		const embeddings = new OpenAIEmbeddings();
		const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name
		//embed the PDF documents
		await PineconeStore.fromDocuments(docs, embeddings, {
			pineconeIndex: index,
			textKey: 'text',
			namespace: id,
		});
		/* Update the pdf_meta table to indicate that the vector upload is complete */
		// const { error } = await supabase
		// 	.from('pdf_meta')
		// 	.update({ vector_upload: true })
		// 	.eq('id', id);
		// if (error) {
		// 	throw new Error(error.message);
		// }
		// });
	} catch (error) {
		console.log('error', error);
		// TODO: db, store rollback
		throw new Error('Failed to ingest your data');
	}
};

(async () => {
	await run();
	console.log('ingestion complete');
})();
