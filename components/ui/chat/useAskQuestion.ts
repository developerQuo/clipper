import { MessageState } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Dispatch, SetStateAction } from 'react';

type inputProps = {
	values: {
		question: string;
		history: [string, string][];
		contentId: string;
		source: string;
	};
	setMessageState: Dispatch<SetStateAction<MessageState>>;
	setLoading: Dispatch<SetStateAction<boolean>>;
	setQuery: Dispatch<SetStateAction<string>>;
	setError: Dispatch<SetStateAction<string | null>>;
};

export default async function useAskQuestion({
	values,
	setMessageState,
	setLoading,
	setQuery,
	setError,
}: inputProps) {
	setMessageState((state) => ({
		...state,
		messages: [
			...state.messages,
			{
				type: 'userMessage',
				message: values.question,
			},
		],
		pending: '',
	}));

	setLoading(true);
	setQuery('');
	const ctrl = new AbortController();
	try {
		await fetchEventSource('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(values),
			signal: ctrl.signal,
			onmessage: (event) => {
				// console.log('event', event.data);
				if (event.data === '[DONE]') {
					setMessageState((state) => {
						// console.log('done', state);
						return {
							history: [
								...state.history,
								[values.question, state.pending ?? ''],
							],
							messages: [
								...state.messages,
								{
									type: 'apiMessage',
									message: state.pending ?? '',
									sourceDocs: state.pendingSourceDocs,
								},
							],
							// pending: undefined,
							pendingSourceDocs: undefined,
						};
					});
					setLoading(false);
					ctrl.abort();
				} else {
					const { data } = JSON.parse(event.data);
					if (data.metadata) {
						// console.log('--------------', data.metadata);
						setMessageState((state) => ({
							...state,
							pendingSourceDocs: data.metadata,
							pending: data.text,
						}));
					} else {
						setMessageState((state) => ({
							...state,
							pending: (state.pending ?? '') + data,
						}));
					}
				}
			},
		});
		setLoading(false);
	} catch (error) {
		setLoading(false);
		setError('An error occurred while fetching the data. Please try again.');
		console.log('error', error);
	}
}
