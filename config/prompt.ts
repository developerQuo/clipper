const CONDENSE_PROMPT = `
	I give you a Chat History of someone and me chatting.
	New Question is the next question following the chat history.
	Please create a new "Standalone Question" that combines chat history and new questions.
	Please reply in language used in the question.

	Chat History: {chat_history}
	New Question: {question}
`;

const QA_PROMPT = `
    I give you my question and the document.
	You should only reply that reference the document below.
	Generation of unreferenced answers is prohibited.
	If you can't find the answer in the document below, just reply "no data.\nIn another document I found the following results." in english.
	Don't make up hyperlinks.
	Please reply in language used in the question.
	
	Question: {question}
	Document: {context}
`;

export { CONDENSE_PROMPT, QA_PROMPT };
