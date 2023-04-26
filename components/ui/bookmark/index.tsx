import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/content/card';
import { QueryType } from '@/types/content';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroll-component';

const limit = 12;

export default function Bookmark() {
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [query, setQuery] = useState<QueryType>();
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			const { data: bookmarks, error: bookmarkError } = await supabase
				.from('bookmark')
				.select('content_id')
				.eq('user_id', userId);

			if (!bookmarks || bookmarkError) {
				setHasMore(false);
				setLoading(false);
				return;
			}
			const contentIds = bookmarks.map((bookmark) => bookmark.content_id);

			const { data, ...result } = await supabase
				.from('content')
				.select(
					'id,title,title_en,summary,published_at,file_path,views,content_source(media(name,name_en)),bookmark(user_id),faq,tags,vector_upload',
					{
						count: 'exact',
					},
				)
				.in('id', [contentIds])
				.is('vector_upload', true)
				.not('file_path', 'is', null)
				.not('published_at', 'is', null)
				.range((page - 1) * limit, page * limit - 1)
				.order('published_at', { ascending: false });

			const bookmarkData = data
				?.filter(({ bookmark }) =>
					Boolean(
						(bookmark as { user_id: string }[]).find(
							({ user_id }) => user_id === userId,
						),
					),
				)
				.map(({ content_source, bookmark, tags, ...row }) => ({
					...row,
					tags: tags?.slice(0, 2),
					media:
						content_source && (content_source as any).length
							? (content_source as any[])[0].media.name
							: null,
					media_en:
						content_source && (content_source as any).length
							? (content_source as any[])[0].media.name_en
							: null,
					bookmark: Boolean(
						(bookmark as { user_id: string }[]).find(
							({ user_id }) => user_id === userId,
						),
					),
				})) as any;
			if (bookmarkData?.length === 0) {
				setHasMore(false);
			} else {
				setQuery((prev) => {
					if (
						prev?.data &&
						bookmarkData &&
						prev.data[0].id === bookmarkData[0].id
					) {
						return prev;
					}
					return {
						...result,
						data: [...(prev?.data || []), ...(bookmarkData || [])],
						count: bookmarkData?.length,
					} as QueryType;
				});
			}
			setLoading(false);
		};

		if (userId) {
			setLoading(true);
			fetch();
		}
	}, [page, userId]);

	return (
		<InfiniteScroll
			dataLength={query?.data?.length ?? 0}
			next={() => setPage((prevPage) => prevPage + 1)}
			hasMore={hasMore}
			loader={loading && <Loading />}
			endMessage={
				<p className="mt-4 text-center text-text-secondary">
					<b>End of Reports</b>
				</p>
			}
		>
			<div className="flex flex-col space-y-2">
				<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
					{query?.data?.map((content, index) => (
						<Card key={index} {...content} />
					))}
				</div>
			</div>
		</InfiniteScroll>
	);
}
