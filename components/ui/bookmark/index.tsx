import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/content/card';
import { QueryType } from '@/types/content';
import Loading from '../Loading';

export default function Bookmark() {
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};
	const [isLoading, setIsLoading] = useState(false);
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
				// .eq('file_type', 'pdf')
				.eq('bookmark.user_id', [userId])
				.not('content', 'is', 'null');
			// .not('id', 'in', '(23, 24, 25, 26, 27, 28)'); // test pdf

			const bookmarkData = data?.map(
				({ content_source, bookmark, ...row }) => ({
					...row,
					media:
						content_source && (content_source as any).length
							? (content_source as any[])[0].media.name
							: null,
					bookmark: Boolean(
						(bookmark as any).length && (bookmark as any)[0].user_id === userId,
					),
				}),
			) as any;
			setQuery({
				...result,
				data: bookmarkData,
				count: bookmarkData?.length,
			});
			setIsLoading(false);
		};

		if (userId) {
			setIsLoading(true);
			fetch();
		}
	}, [userId]);

	return (
		<>
			{isLoading && <Loading />}
			<div className="flex flex-col space-y-2">
				<div className="grid grid-cols-1 gap-4 gap-y-10 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
					{query?.data?.map((content, index) => (
						<Card key={index} {...content} />
					))}
				</div>
			</div>
		</>
	);
}
