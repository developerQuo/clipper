import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/content/card';
import { QueryType } from '@/types/content';

export default function Bookmark() {
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
				.eq('file_type', 'pdf')
				.eq('vector_upload', true)
				.eq('bookmark.user_id', userId)
				.not('id', 'in', '(23, 24, 25, 26, 27, 28)'); // test pdf

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
			setQuery({
				...result,
				data: bookmarkData,
				count: bookmarkData?.length,
			});
			setIsLoading(false);
		};

		if (userId) {
			fetch();
		}
	}, [userId]);

	return (
		<div className="flex flex-col space-y-2">
			<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
				{query?.data?.map((content, index) => (
					<Card key={index} {...content} />
				))}
			</div>
		</div>
	);
}
