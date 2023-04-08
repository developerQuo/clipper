import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from './card';
import { Content as ContentType, QueryType } from '@/types/content';
import { useRouter } from 'next/router';
import { getColor } from '@/utils/randomColor';

const pageLength = 12;

export default function Content() {
	const router = useRouter();
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState<QueryType>();
	const [page, setPage] = useState(0);

	// TODO: infinite scrolling, last page error - range 범위 넘어가면 에러
	const fetch = useCallback(async () => {
		const rangePage = page * pageLength;
		const { data, ...result } = await supabase
			.from('content')
			.select(
				'id,title,summary,published_at,file_path,views,content_source(media(name)),bookmark(user_id),faq,tags',
				{
					count: 'exact',
				},
			)
			.eq('vector_upload', true)
			.eq('bookmark.user_id', userId)
			.not('content', 'is', 'null')
			.not('id', 'in', '(23, 24, 25, 26, 27, 28)') // test pdf
			.range(rangePage, rangePage - 1 + pageLength)
			.order('published_at', { ascending: false });
		if (!result.error) {
			const contentData = data?.map(({ content_source, bookmark, ...row }) => ({
				...row,
				media:
					content_source && (content_source as any).length
						? (content_source as any[])[0].media.name
						: null,
				bookmark: Boolean(
					(bookmark as any).length && (bookmark as any)[0].user_id === userId,
				),
			})) as ContentType[];
			// console.log(data);
			setQuery({
				...result,
				data: [...(query?.data ? query.data : []), ...contentData],
			} as QueryType);
		}
		setIsLoading(false);
	}, [page, query?.data, userId]);

	useEffect(() => {
		if (userId && !query) {
			console.log('fetched');
			fetch();
		}
	}, [fetch, query, userId]);

	const handleLoadMore = () => {
		setPage(page + 1);
		fetch();
	};
	return (
		<div className="flex flex-col space-y-2">
			<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
				{query?.data?.map((content, index) => {
					const [background, color] =
						router.pathname === '/trend' ? getColor(index) : [];
					return (
						<Card
							key={index}
							background={background}
							color={color}
							{...content}
						/>
					);
				})}
			</div>
			<button className="p-12" onClick={handleLoadMore}>
				Load More
			</button>
		</div>
	);
}
