import ChatDoc from '@/components/ui/chat/test-page';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ColumnType } from 'rc-table/lib/interface';
import Table from '@/components/ui/Table';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SelectedKeyType, SelectedKeyState } from '@/store/table';
import Viewer from '@/components/ui/content/viewer';
import { SelectedContent, SelectedContentState } from '@/store/content';
import { PostgrestSingleResponse } from '@supabase/supabase-js';
import Bookmark from '../../components/ui/bookmark/button';
import { supabase } from '@/utils/supabase-client';
import { getSession, useSession } from 'next-auth/react';
import { Textarea } from '@/components/ui/TextArea';
import { CONDENSE_PROMPT, QA_PROMPT } from '@/config/prompt';
import Link from 'next/link';
import { Content } from '@/types/content';

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
					'id,title,summary,published_at,file_path,views,content_source(media(name)),bookmark(user_id)',
					{
						count: 'exact',
					},
				)
				.eq('file_type', 'pdf')
				.eq('bookmark.user_id', userId)
				.in('id', [23, 24, 25, 26, 27, 28]);

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

	const [model, setModel] = useState<string>('gpt-3.5-turbo');
	const [temperature, setTemperature] = useState<number>(0);
	const [top_p, setTop_p] = useState<number>(1);
	const [n, setN] = useState<number>(1);
	const [presence_penalty, setPresence_penalty] = useState<number>(0);
	const [frequency_penalty, setFrequency_penalty] = useState<number>(0);

	const fileUrl = useMemo(() => {
		if (selectedContent?.file_path) {
			const { data } = supabase.storage
				.from('test')
				.getPublicUrl(selectedContent.file_path);

			return data.publicUrl;
		}
	}, [selectedContent?.file_path]);
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
					<div className="space-y-4 border border-gray-100 p-4">
						<div className="text-center text-xl font-bold">Chat Options</div>
						<div className="flex gap-2">
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									model
								</label>
								<input
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={model}
									onChange={(e: any) => setModel(e.target.value)}
								/>
							</div>
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									temperature
								</label>
								<input
									type="number"
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={temperature}
									onChange={(e: any) => setTemperature(e.target.value)}
								/>
							</div>
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									top_p
								</label>
								<input
									type="number"
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={top_p}
									onChange={(e: any) => setTop_p(e.target.value)}
								/>
							</div>
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									n
								</label>
								<input
									type="number"
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={n}
									onChange={(e: any) => setN(e.target.value)}
								/>
							</div>
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									presence_penalty
								</label>
								<input
									type="number"
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={presence_penalty}
									onChange={(e: any) => setPresence_penalty(e.target.value)}
								/>
							</div>
							<div className="form-control w-full items-start gap-4">
								<label className="text-base font-bold text-text-primary">
									frequency_penalty
								</label>
								<input
									type="number"
									className="input-bordered input focus:border-secondary focus:text-secondary"
									value={frequency_penalty}
									onChange={(e: any) => setFrequency_penalty(e.target.value)}
								/>
							</div>
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
								<Link href={fileUrl ?? '#'} legacyBehavior>
									<a target="_blank" className="btn-secondary btn">
										원본 보기
									</a>
								</Link>
								<button
									className="btn-outline btn-error btn-square btn"
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
						</div>
					</div>
					<div className="absolute right-24 top-72">
						<ChatDoc
							condensePrompt={standalonePrompt}
							qaPrompt={docPrompt}
							{...{
								model,
								temperature,
								top_p,
								n,
								presence_penalty,
								frequency_penalty,
							}}
						/>
					</div>
				</>
			)}
		</div>
	);
}
