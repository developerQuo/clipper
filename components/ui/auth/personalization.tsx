import { getProviders, signIn, getSession } from 'next-auth/react';
import Drawer from '../Drawer';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import CheckButton from './button';
import CheckMultiple from './check-multiple';
import { useRouter } from 'next/router';
import SkipModal from './skip-modal';

export interface IForm {
	industry: string[];
	department: string[];
	interest: string[];
}

export type Page1Form = Pick<IForm, 'industry' | 'department'>;
export type Page2Form = Pick<IForm, 'interest'>;

type InputProps = {};

const Personalization = ({}: InputProps) => {
	const router = useRouter();
	const [page, setPage] = useState<1 | 2>(1);
	const {
		register,
		handleSubmit,
		formState: { isValid, errors, dirtyFields, isDirty },
		watch,
		setValue,
		getValues,
		reset,
	} = useForm<IForm>({
		defaultValues: {
			industry: [],
			department: [],
		},
	});
	const watchIndustry = watch('industry');
	console.log('watchIndustry', watchIndustry);
	const watchDepartment = watch('department');
	// console.log('watchDepartment', watchDepartment);
	// console.log(errors);

	const handler = (data: IForm) => {
		console.log('submit');
		if (page === 1) {
			console.log(data);
			if (true) {
				setPage(2);
			}
		}
		if (page === 2) {
			router.push('/');
		}
	};
	return (
		<div className="">
			{page === 1 ? (
				<form onSubmit={handleSubmit(handler)} className="space-y-12 px-20">
					<div className="text-center">
						<div className="text-xl font-bold">산업 선택하기</div>
						<div className="text-lg text-text-secondary">
							{watchIndustry?.length}/2
						</div>
						<CheckMultiple
							options={industryOptions.map((option) => ({
								label: option,
								value: option,
							}))}
							{...register('industry')}
						/>
					</div>
					<div className="text-center">
						<div className="text-xl font-bold">직무 선택하기</div>
						<div className="text-lg text-text-secondary">
							{watchDepartment?.length}/2
						</div>
						<CheckMultiple
							options={departmentOptions.map((option) => ({
								label: option,
								value: option,
							}))}
							{...register('department')}
						/>
					</div>
					<div className="mx-auto flex w-2/5 flex-col space-y-4">
						<button className="btn-primary btn rounded-3xl" type="submit">
							다음
						</button>
						<label
							className="btn-ghost btn rounded-3xl text-text-secondary"
							htmlFor="skip-personalization"
						>
							건너뛰기
						</label>
					</div>
				</form>
			) : (
				<form onSubmit={handleSubmit(handler)} className="space-y-12 px-20">
					<div className="text-center">
						<div className="text-xl font-bold">관심사 선택하기</div>
						<div className="text-lg text-text-secondary">
							{watchIndustry?.length}/2
						</div>
						<CheckMultiple
							options={industryOptions.map((option) => ({
								label: option,
								value: option,
							}))}
							{...register('industry')}
						/>
					</div>
					<div className="mx-auto flex w-2/5 flex-col space-y-4">
						<button className="btn-primary btn rounded-3xl" type="submit">
							다음
						</button>
					</div>
				</form>
			)}
			<SkipModal />
		</div>
	);
};

export default Personalization;

const industryOptions = [
	'IT/소프트웨어',
	'금융',
	'교육',
	'부동산/건설',
	'바이오',
	'제조',
	'도소매/유통',
	'미디어/엔터테인먼트',
	'여행/관광',
	'식품/음식',
	'스포츠/레저',
	'패션/잡화',
	'의료/건강',
	'물류/운송',
	'에너지/환경',
];

const departmentOptions = [
	'최고경영자',
	'사업 전략/기획',
	'마케팅 전략/기획',
	'홍보 전략/기획',
	'개발/테크',
	'데이터/분석',
	'영업 전략/기획',
	'디자인',
	'인사',
	'기타',
];
