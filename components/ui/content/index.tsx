import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Filter from './filter';
import Card from './card';
import { QueryType } from '@/types/content';

export default function Content() {
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [isLoading, setIsLoading] = useState(true);
	const [query, setQuery] = useState<QueryType>();

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
				.eq('vector_upload', true)
				.eq('bookmark.user_id', userId)
				.not('id', 'in', '(23, 24, 25, 26, 27, 28)') // test pdf
				.order('published_at', { ascending: false });
			const content = {
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
			};
			setQuery(content);
			setIsLoading(false);
		};

		if (userId) {
			fetch();
		}
	}, [userId]);

	const [offset, setOffset] = useState(0);
	const [cards, setCards] = useState([]);

	const handleLoadMore = () => {
		setOffset(offset + 10);
	};

	return (
		<div className="flex flex-col space-y-2">
			<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
				{query?.data?.map((content, index) => (
					<Card key={index} {...content} />
				))}
			</div>
		</div>
	);
}
