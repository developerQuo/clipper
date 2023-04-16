const CONDENSE_PROMPT = `
	I give you a Chat History of someone and me chatting.
	New Question is the next question following the chat history.
	Please create a new "Standalone Question" that combines chat history and new questions.
	Please reply in korean.

	Chat History: {chat_history}
	New Question: {question}

	Standalone question:`;

const QA_PROMPT = `
    I give you my question and the document.
	Don't make up hyperlinks.
	Please reply in 1000 Korean characters or less.
	
	Question: {question}
	Document: {context}

	Helpful answer in markdown:`;

export { CONDENSE_PROMPT, QA_PROMPT };
