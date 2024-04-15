import { supabase } from '@/utils/supabase-client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Request } from './types';

const limit = 10;

// TODO: 무한 스크롤 테스트
export default function MyRequest() {
	const { data: session } = useSession();
	const { id: userId } = session?.user ?? {};

	const [content, setContent] = useState<Request[]>();
	const [loading, setLoading] = useState<boolean>(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	useEffect(() => {
		const fetch = async () => {
			setLoading(true);
			const { data, error } = await supabase
				.from('request')
				.select('*')
				.eq('user_id', userId)
				.range((page - 1) * limit, page * limit - 1)
				.order('id', { ascending: false });
			if (!error && data && data.length > 0) {
				setContent(data as Request[]);
			}
			if (data?.length === 0) {
				setHasMore(false);
			} else if (data) {
				setContent((prev) => {
					if (prev && prev[0]!.id === data[0].id) {
						return prev;
					}
					return [...(prev || []), ...(data as Request[])];
				});
			}
			setLoading(false);
		};
		if (userId) {
			fetch();
		}
	}, [page, userId]);
	return (
		<InfiniteScroll
			dataLength={content?.length ?? 0}
			next={() => setPage((prevPage) => prevPage + 1)}
			hasMore={hasMore}
			loader={loading && <Loading />}
			endMessage={
				<p className="mt-4 text-center text-text-secondary">
					<b>End of Reports</b>
				</p>
			}
		>
			<div className="p-5">
				<Accordion type="single" collapsible className="w-3/5 flex-col">
					{content?.map((req, index) => (
						<div key={index}>
							<AccordionItem value={`item-${index}`} className="py-4">
								<AccordionTrigger>
									<div className="flex items-center space-x-8">
										<h3 className="text-lg font-semibold">
											{req?.note?.slice(0, 30) ?? ''}...
										</h3>{' '}
										<span className="text-xs text-text-secondary">
											{moment(req?.created_at).format('YYYY-MM-DD')}
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent>
									<ReactMarkdown>
										{req?.note?.slice(0, 300).replaceAll('\n', ' ') ?? ''}
									</ReactMarkdown>
									{/* <Link href={`/generate/${req?.id}`} legacyBehavior>
										<a className="btn float-right mb-4 mt-12 w-32 rounded-3xl">
											전체보기
										</a>
									</Link> */}
								</AccordionContent>
							</AccordionItem>
						</div>
					))}
				</Accordion>
			</div>
		</InfiniteScroll>
	);
}
