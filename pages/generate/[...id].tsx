import { GetServerSideProps } from 'next';
import { useMemo, useState } from 'react';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { supabase } from '@/utils/supabase-client';
import Bookmark from '@/components/ui/bookmark/button';
import Link from 'next/link';
import Share from '@/components/ui/share';
import ChatDoc from '@/components/ui/generate/chat';
import { Content } from '@/store/content';
import moment from 'moment';
import Image from 'next/image';
import {
	SelectedGeneratedContent,
	SelectedGeneratedContentState,
} from '@/store/generated-content';
import { useRecoilValue } from 'recoil';

type InputProps = { content: SelectedGeneratedContent };

export default function Clip({ content: existContent }: InputProps) {
	const [loading, setLoading] = useState(false);
	const newContent = useRecoilValue<SelectedGeneratedContent>(
		SelectedGeneratedContentState,
	);
	const { id, title, published_at, bookmark, content } =
		existContent || newContent || {};
	const publishedAt = moment(published_at).format('YYYY-MM-DD');

	const onSave = async () => {
		if (!title || !content) return;
		setLoading(true);
		await fetch('/api/generate/save', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
				content,
				published_at: publishedAt,
			}),
		})
			.then(async (res) => {
				const { ok } = await res.json();

				// TODO: modal로 변경
				if (ok) {
					alert('저장되었습니다.');
				}
			})
			.catch((err) => {
				new Error(err);
			});
		setLoading(false);
	};
	return (
		<div className="flex h-full">
			<div className="flex flex-col justify-between px-8 py-12">
				<div className="w-[340px]">
					<div className="flex flex-col">
						<div className="text-lg font-semibold">{title}</div>
						<p className="pt-4 text-default">
							<span className="text-text-secondary">{publishedAt}</span>
						</p>
					</div>
					<div className="mt-10 flex items-center justify-between space-x-5">
						<div className="flex items-center space-x-4">
							{id && <Bookmark id={id} bookmark={bookmark ?? false} disabled />}
							<Share title={title ?? ''} description={''} />{' '}
						</div>
						<div className="space-x-2">
							<button
								className={`btn-outline btn-sm btn rounded-3xl border-none bg-white font-semibold ${
									loading ? 'loading' : ''
								}`}
								onClick={onSave}
							>
								저장
							</button>
							<button
								className="btn-outline btn-sm btn rounded-3xl border-none bg-white font-semibold"
								disabled
							>
								복사
							</button>
						</div>
					</div>
				</div>
				<div className="w-[110px]">
					<Link href="/generate" className="btn-ghost btn-circle btn bg-white">
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
				<ChatDoc content={content!} />
			</div>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<InputProps> = async (
	context,
) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;

	const result = context.params?.id as string[];
	if (!result || !result.length) return;

	console.log(result);
	const id = result[0];
	if (id) {
		const { data } = await supabase
			.from('generated_content')
			.select('*')
			.eq('id', id)
			.single();

		return {
			props: {
				content: data,
			},
		};
	}
	return { props: {} };
};
