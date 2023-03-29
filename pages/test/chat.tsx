import ChatDoc from '@/components/ui/chat/test';
import { useEffect, useRef, useState } from 'react';
import { ColumnType } from 'rc-table/lib/interface';
import Table from '@/components/ui/Table';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SelectedKeyType, SelectedKeyState } from '@/store/table';
import Viewer from '@/components/ui/pdf/viewer';
import {
	SelectedContent,
	Content,
	SelectedContentState,
} from '@/store/content';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import Bookmark from '../../components/ui/pdf/bookmark';
import { supabase } from '@/utils/supabase-client';
import { getSession, useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/TextArea';

const columns: ColumnType<Content>[] = [
	{
		title: 'Media',
		dataIndex: 'media',
		width: 300,
	},
	{
		title: 'Title',
		dataIndex: 'title',
	},
];

type QueryType = PostgrestSingleResponse<Content[]>;

const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`;

const QA_PROMPT = `You are an AI assistant providing helpful advice. You are given the following extracted parts of a long document and a question. Provide a conversational answer based on the context provided.
You should only provide hyperlinks that reference the context below. Do NOT make up hyperlinks.
If you can't find the answer in the context below, just say "Hmm, I'm not sure." Don't try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.
Provide a answer in the language of the question asked.

Question: {question}
=========
{context}
=========
Answer in Markdown:`;

export default function Drawer() {
	const drawerRef = useRef<HTMLInputElement | null>(null);
	const [selectedKey, setSelectedKey] =
		useRecoilState<SelectedKeyType>(SelectedKeyState);
	const [selectedContent, setSelectedContent] =
		useRecoilState<SelectedContent>(SelectedContentState) || {};

	useEffect(() => {
		if (selectedKey) {
			drawerRef.current?.click();
		}
	}, [selectedKey]);

	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState<QueryType>();
	const [bookmarkQuery, setBookmarkQuery] = useState<QueryType>();

	useEffect(() => {
		const fetch = async () => {
			const { data, ...result } = await supabase
				.from('content')
				.select(
					'id,title,summary,published_at,path,views,content_source(media(name)),bookmark(user_id)',
					{
						count: 'exact',
					},
				)
				.eq('file_type', 'pdf')
				.eq('bookmark.user_id', userId);

			setQuery({
				...result,
				data: data?.map(({ content_source, bookmark, ...row }) => ({
					...row,
					media:
						content_source && (content_source as any).length
							? (content_source as any[])[0].media.name
							: null,
					bookmark: Boolean(
						(bookmark as any).length && (bookmark as any)[0].user_id === userId,
					),
				})) as any,
			});
			const bookmarkData = data
				?.filter(({ bookmark }) =>
					Boolean(
						(bookmark as any).length && (bookmark as any)[0].user_id === userId,
					),
				)
				.map(({ content_source, bookmark, ...row }) => ({
					...row,
					media:
						content_source && (content_source as any).length
							? (content_source as any[])[0].media.name
							: null,
					bookmark: Boolean(
						(bookmark as any).length && (bookmark as any)[0].user_id === userId,
					),
				})) as any;
			setBookmarkQuery({
				...result,
				data: bookmarkData,
				count: bookmarkData?.length,
			});
			setIsLoading(false);
		};

		if (userId) {
			fetch();
		}
	}, [selectedContent?.bookmark, userId]);
	const [standalonePrompt, setStandalonePrompt] =
		useState<string>(CONDENSE_PROMPT);
	const [docPrompt, setDocPrompt] = useState<string>(QA_PROMPT);
	return (
		<div className="drawer">
			<input
				ref={drawerRef}
				id="report-drawer"
				type="checkbox"
				className="drawer-toggle"
				onChange={(event) => {
					if (!event.target.checked) {
						setSelectedKey(undefined);
					}
				}}
			/>
			<div className="drawer-content">
				<div className="space-y-24">
					<div className="flex gap-2">
						<div className="form-control w-full items-start gap-4">
							<label className="text-base font-bold text-text-primary">
								Standalone question prompt
							</label>
							<Textarea
								className="textarea-bordered textarea h-[25rem] w-full focus:border-secondary focus:text-secondary"
								value={standalonePrompt}
								onChange={(e: any) => setStandalonePrompt(e.target.value)}
							/>
						</div>
						<div className="form-control w-full items-start gap-4">
							<label className="text-base font-bold text-text-primary">
								Document prompt
							</label>
							<Textarea
								className="textarea-bordered textarea h-[25rem] w-full focus:border-secondary focus:text-secondary"
								value={docPrompt}
								onChange={(e: any) => setDocPrompt(e.target.value)}
							/>
						</div>
					</div>
					<div className="space-y-8">
						<h1 className="text-center text-3xl font-bold">Today</h1>
						<div className="flex flex-col space-y-2">
							<Table
								data={query?.data ?? []}
								columns={columns}
								count={query?.count ?? 0}
								additionalRowClick={setSelectedContent}
							/>
						</div>
					</div>
					<div className="space-y-8">
						<h1 className="text-center text-3xl font-bold">Bookmark</h1>
						<div className="flex flex-col space-y-2">
							<Table
								data={bookmarkQuery?.data ?? []}
								columns={columns}
								count={bookmarkQuery?.count ?? 0}
								additionalRowClick={setSelectedContent}
							/>
						</div>
					</div>
				</div>
			</div>
			{selectedKey && (
				<>
					<div className="drawer-side">
						<label htmlFor="report-drawer" className="drawer-overlay"></label>
						<div className="w-1/2 bg-base-100">
							<div className="flex justify-between p-4">
								<Bookmark />
								<button
									className="btn-error btn-outline btn-square btn"
									onClick={() => drawerRef.current?.click()}
								>
									{' '}
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-6 w-6"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</button>
							</div>
							<Viewer />
						</div>
					</div>
					<div className="absolute right-24 top-48">
						<ChatDoc condensePrompt={standalonePrompt} qaPrompt={docPrompt} />
					</div>
				</>
			)}
		</div>
	);
}
