import { GetServerSideProps } from 'next';
import { useMemo } from 'react';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { supabase } from '@/utils/supabase-client';
import Bookmark from '@/components/ui/bookmark/button';
import Link from 'next/link';
import Share from '@/components/ui/content/share';
import ChatDoc from '@/components/ui/chat';
import { Content } from '@/store/content';
import moment from 'moment';

type InputProps = { content: Content };

export default function Clip({ content }: InputProps) {
	const { id, title, file_path, published_at, media, tags, bookmark } = content;
	const publishedAt = moment(published_at).format('YYYY-MM-DD');
	const fileUrl = useMemo(() => {
		if (file_path) {
			const { data } = supabase.storage.from('docs').getPublicUrl(file_path);

			return data.publicUrl;
		}
	}, [file_path]);
	const source = useMemo(() => `${media}/${title}`, [media, title]);
	return (
		<div className="flex">
			<div className="w-[110px]">
				<Link href="/" className="btn">
					뒤로
				</Link>
			</div>
			<div className="w-1/3 max-w-[400px] bg-base-100">
				<div className="flex flex-col">
					<div className="text-2xl font-bold">
						{title} ({publishedAt})
					</div>
					<div className="text-lg font-semibold">{media}</div>
					<div>{tags}</div>
				</div>
				<div className="flex justify-between p-4">
					<Bookmark id={id} bookmark={bookmark} />
					<Link href={fileUrl ?? '#'} legacyBehavior>
						<a target="_blank" className="btn-secondary btn">
							원본 보기
						</a>
					</Link>
					{/* <Share /> */}
				</div>
			</div>
			<ChatDoc contentId={id} source={source} />
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<InputProps> = async (
	context,
) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	const userId = guard.props.session.user.id;

	const result = context.params?.id as string[];
	if (!result || !result.length) return;

	const id = result[0];
	const { data } = await supabase
		.from('content')
		.select(
			'id,title,summary,published_at,file_path,views,content_source(media(name)),bookmark(user_id)',
		)
		.eq('id', id)
		.eq('bookmark.user_id', userId);

	if (!data || !data.length) return;
	const content = data[0];
	return {
		props: {
			content: {
				...content,
				media:
					content.content_source && (content.content_source as any).length
						? (content.content_source as any[])[0].media.name
						: null,
				bookmark: Boolean(
					(content.bookmark as any).length &&
						(content.bookmark as any)[0].user_id === userId,
				),
			},
		},
	};
};
