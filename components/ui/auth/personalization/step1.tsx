import { useForm } from 'react-hook-form';
import CheckMultiple from '../check-multiple';
import { Page, Page1Form } from './type';

type InputProps = {
	setPage: (page: Page) => void;
	setPersonalization: (value: Partial<Page1Form>) => void;
};

const Step1 = ({ setPage, setPersonalization }: InputProps) => {
	const {
		register,
		handleSubmit,
		formState: { isValid, errors, dirtyFields, isDirty },
		watch,
	} = useForm<Page1Form>({
		defaultValues: {
			industry: [],
			department: [],
		},
	});
	const watchIndustry = watch('industry');
	const watchDepartment = watch('department');

	const handler = ({ industry, department }: Page1Form) => {
		console.log('submit');
		if (industry.length && department.length) {
			setPersonalization({ industry, department });
			setPage(2);
		}
	};
	return (
		<form
			onSubmit={handleSubmit(handler)}
			className="max-w-xl space-y-16 text-center"
		>
			<div className="space-y-7">
				<div className="space-y-2">
					<div className="text-xl font-bold">산업 선택하기</div>
					<div className="text-lg text-text-secondary">
						{watchIndustry?.length}/2
					</div>
				</div>
				<CheckMultiple
					options={industryOptions.map((option) => ({
						label: option,
						value: option,
					}))}
					checkedOptions={watchIndustry}
					{...register('industry')}
				/>
			</div>
			<div className="space-y-7">
				<div className="space-y-2">
					<div className="text-xl font-bold">직무 선택하기</div>
					<div className="text-lg text-text-secondary">
						{watchDepartment?.length}/2
					</div>
				</div>
				<CheckMultiple
					options={departmentOptions.map((option) => ({
						label: option,
						value: option,
					}))}
					checkedOptions={watchDepartment}
					{...register('department')}
				/>
			</div>
			<div className="mx-auto flex w-3/5 flex-col space-y-4">
				<button className="btn rounded-3xl" type="submit">
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
	);
};

export default Step1;

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
