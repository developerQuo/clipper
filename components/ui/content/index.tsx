import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from './card';
import { Content as ContentType, QueryType } from '@/types/content';
import { useRouter } from 'next/router';
import { getColor } from '@/utils/randomColor';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../Loading';

const limit = 11;

export default function Content() {
	const router = useRouter();
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [query, setQuery] = useState<QueryType>();
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			const { data, ...result } = await supabase
				.from('content')
				.select(
					'id,title,summary,published_at,file_path,views,content_source(media(name)),bookmark(user_id),faq,tags',
					{
						count: 'exact',
					},
				)
				.eq('file_type', 'pdf')
				.not('content', 'is', 'null')
				.range((page - 1) * limit, page * limit - 1)
				.order('published_at', { ascending: false });
			if (!result.error) {
				const contentData = data?.map(
					({ content_source, bookmark, ...row }) => ({
						...row,
						media:
							content_source && (content_source as any).length
								? (content_source as any[])[0].media.name
								: null,
						bookmark: Boolean(
							(bookmark as any).length &&
								(bookmark as any)[0].user_id === userId,
						),
					}),
				) as ContentType[];

				if (contentData.length === 0) {
					setHasMore(false);
				} else {
					setQuery((prev) => {
						if (prev?.data && prev.data[0].id === contentData[0].id) {
							return prev;
						}
						return {
							...result,
							data: [...(prev?.data || []), ...contentData],
						} as QueryType;
					});
				}
				setLoading(false);
			}
		};
		if (userId) {
			console.log('fetched');
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
			<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
				{query?.data?.map(({ tags, ...content }, index) => {
					const [background, color] =
						router.pathname === '/trend' ? getColor(index) : [];
					const tagsValue = router.pathname === '/trend' ? [] : tags;
					return (
						<Card
							key={index}
							background={background}
							color={color}
							tags={tagsValue}
							{...content}
						/>
					);
				})}
			</div>
		</InfiniteScroll>
	);
}
