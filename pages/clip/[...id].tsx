import { GetServerSideProps } from 'next';
import { useMemo } from 'react';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { supabase } from '@/utils/supabase-client';
import Bookmark from '@/components/ui/bookmark/button';
import Link from 'next/link';
import Share from '@/components/ui/share';
import ChatDoc from '@/components/ui/chat';
import moment from 'moment';
import Image from 'next/image';
import Tags from '@/components/ui/content/tags';
import { Content } from '@/types/content';

type InputProps = { content: Content };

export default function Clip({ content }: InputProps) {
	const {
		id,
		title,
		title_en,
		file_path,
		published_at,
		media,
		media_en,
		tags,
		bookmark,
		summary,
	} = content;
	const publishedAt = moment(published_at).format('YYYY-MM-DD');
	const fileUrl = useMemo(() => {
		if (file_path) {
			const { data } = supabase.storage.from('docs').getPublicUrl(file_path);

			return data.publicUrl;
		}
	}, [file_path]);
	const source = useMemo(() => `${media}/${title}`, [media, title]);
	console.log(id)
	return (
		<div className="flex h-full">
			<div className="flex flex-col justify-between px-8 py-12">
				<div className="w-[340px]">
					<div className="flex flex-col">
						<div className="text-lg font-semibold">{title_en}</div>
						<p className="space-x-3 pt-4 text-default">
							<span className="font-medium">{media_en}</span>
							<span className="text-text-secondary">{publishedAt}</span>
						</p>
						<div className="mt-8 flex flex-wrap gap-2 overflow-x-auto py-2">
							<Tags tags={tags} />
						</div>
					</div>
					<div className="mt-10 flex items-center space-x-6">
						<Bookmark id={id} bookmark={bookmark} />
						<Link href={fileUrl ?? '#'} legacyBehavior>
							<a target="_blank" className="p-1">
								<Image
									src={`/icons/outlink.svg`}
									alt={`outlink`}
									width={15}
									height={15}
								/>
							</a>
						</Link>
						<Share title={title_en} description={summary} />
					</div>
				</div>
				<div className="w-[110px]">
					<Link href="/" className="btn-ghost btn-circle btn bg-white">
						<Image
							src={`/icons/back.svg`}
							alt={`back`}
							width={16}
							height={15.6}
						/>
					</Link>
				</div>
			</div>
			<div className="h-full w-full bg-white py-12">
				<ChatDoc
					contentId={id}
					source={source}
					summary={content.summary}
					faq={content.faq}
				/>
			</div>
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
			'id,title,title_en,summary,published_at,file_path,views,content_source(media(name,name_en)),bookmark(user_id),faq,tags',
		)
		.eq('id', id)
		.eq('bookmark.user_id', userId);

	if (!data || !data.length) return;
	const content = data[0];
	return {
		props: {
			content: {
				...content,
				tags: content.tags?.slice(0, 9),
				media:
					content.content_source && (content.content_source as any).length
						? (content.content_source as any[])[0].media.name
						: null,
				media_en:
					content.content_source && (content.content_source as any).length
						? (content.content_source as any[])[0].media.name_en
						: null,
				bookmark: Boolean(
					(content.bookmark as any).length &&
						(content.bookmark as any)[0].user_id === userId,
				),
			},
		},
	};
};
