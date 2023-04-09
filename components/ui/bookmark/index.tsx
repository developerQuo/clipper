import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/content/card';
import { QueryType } from '@/types/content';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroll-component';

const limit = 11;

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
					'id,title,summary,published_at,file_path,views,content_source(media(name)),bookmark(user_id)',
					{
						count: 'exact',
					},
				)
				.in('id', [contentIds])
				.range((page - 1) * limit, page * limit - 1);

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
