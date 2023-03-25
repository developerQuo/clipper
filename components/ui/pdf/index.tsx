import ChatDoc from '@/components/ui/chat';
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
import Bookmark from './bookmark';
import { supabase } from '@/utils/supabase-client';
import { getSession, useSession } from 'next-auth/react';

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
						<div className="w-1/2 overflow-auto bg-base-100 p-4">
							<Bookmark />
							<Viewer />
						</div>
					</div>
					<div className="absolute right-24 top-32">
						<ChatDoc />
					</div>
				</>
			)}
		</div>
	);
}
