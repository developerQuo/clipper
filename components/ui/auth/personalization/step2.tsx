import { useForm } from 'react-hook-form';
import CheckMultiple from '../check-multiple';
import { useRouter } from 'next/router';
import { OptionType } from '../../types';
import { Page1Form, Page2Form } from './type';
import LoadingDots from '../../LoadingDots';

type InputProps = {
	personalization: Partial<Page1Form>;
	options: OptionType[];
	loading?: boolean;
};

const Step2 = ({ personalization, options, loading }: InputProps) => {
	const router = useRouter();
	const { register, handleSubmit, watch } = useForm<Page2Form>({
		defaultValues: {
			interest: [],
		},
	});
	const watchInerest = watch('interest');

	const handler = ({ interest }: Page2Form) => {
		console.log('submit');
		const { industry, department } = personalization;
		if (interest.length && industry?.length && department?.length) {
			fetch('/api/personalization/insert', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ ...personalization, interest }),
			})
				.then(async (res) => {
					const { ok } = (await res.json()) as { ok: boolean };

					if (ok) {
						router.push('/');
					} else {
						alert('다시 시도하십시오.');
					}
				})
				.catch((err) => {
					console.log(err.message);
					new Error(err);
				});
		}
	};

	return (
		<form
			onSubmit={handleSubmit(handler)}
			className="max-w-xl space-y-16 text-center"
		>
			<div className="space-y-7">
				<div className="space-y-2">
					<div className="text-xl font-bold">관심사 선택하기</div>
					<div className="text-lg text-text-secondary">
						{watchInerest?.length}/3
					</div>
				</div>
				{loading && (
					<div className="my-20">
						<LoadingDots style="large" />
					</div>
				)}
				<CheckMultiple
					options={options}
					checkedOptions={watchInerest}
					maxChecked={3}
					{...register('interest')}
				/>
			</div>
			<div className="mx-auto flex w-3/5 min-w-[345px] flex-col space-y-4">
				<button className="btn rounded-3xl" type="submit">
					다음
				</button>
			</div>
		</form>
	);
};

export default Step2;
