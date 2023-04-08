import { GetServerSideProps } from 'next';
import serverSideAuthGuard from '@/components/utils/serverSideAuthGuard';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSetRecoilState } from 'recoil';
import {
	SelectedGeneratedContent,
	SelectedGeneratedContentState,
} from '@/store/generated-content';
import { useRouter } from 'next/router';

export type IForm = {
	prompt: string;
};

// TODO: loading
export default function Generate() {
	const [loading, setLoading] = useState(false);
	const setGeneratedContent = useSetRecoilState<SelectedGeneratedContent>(
		SelectedGeneratedContentState,
	);
	const router = useRouter();
	const { register, handleSubmit } = useForm<IForm>();
	const onGenerate = async ({ prompt }: IForm) => {
		setLoading(true);
		await fetch('/api/generate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ prompt }),
		})
			.then(async (res) => {
				const { data } = await res.json();
				setGeneratedContent({
					title: prompt,
					content: data,
				});
				setLoading(false);
				router.push('/generate/new');
			})
			.catch((err) => {
				new Error(err);
			});
	};
	return (
		<div className="flex flex-col items-center justify-between space-y-12 px-10 py-32">
			<div className="text-center text-xl font-semibold">
				<p>나만의 리포트를 만들어보세요. </p>
				<p>
					원하는 리포트에 대한 구체적인 상황, 배경을 적어주시면 정확도가
					올라간답니다.
				</p>
			</div>
			<form
				className="flex w-full max-w-[640px] flex-1 flex-col space-y-20"
				onSubmit={handleSubmit(onGenerate)}
			>
				<textarea
					className="textarea-bordered textarea relative w-full resize-none rounded-lg bg-white px-7 py-5 text-black outline-0"
					placeholder="eg. 나는 HR 관련된 B2B SaaS 사업을 하고 있는데, 올해 고객사 수를 2배 증가시키고 싶어. 
유료와 무료 활동 모두 고려한 적절한 마케팅 실행 전략을 5가지 제안해줘."
					{...register('prompt')}
				/>
				<button className={`btn rounded-3xl ${loading ? 'loading' : ''}`}>
					Generate
				</button>
			</form>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const guard = (await serverSideAuthGuard(context)) as any;
	if (guard.hasOwnProperty('redirect')) return guard;
	return {
		props: {},
	};
};
