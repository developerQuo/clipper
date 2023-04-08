import { useEffect, useState } from 'react';
import SkipModal from '../skip-modal';
import Step1 from './step1';
import dynamic from 'next/dynamic';
import { Page, Page1Form, Page2Form } from './type';
import { OptionType } from '../../types';

const loading = () => <div>Loading...</div>;
const Step2 = dynamic(() => import('./step2'), { loading });

const Personalization = () => {
	const [page, setPage] = useState<Page>(1);
	const [personalization, setPersonalization] =
		useState<Partial<Page1Form> | null>(null);
	const [options, setOptions] = useState<OptionType[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchOptions = async () => {
			fetch('/api/personalization/fetch-options', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(personalization),
			})
				.then(async (res) => {
					const { interest } = (await res.json()) as Page2Form;
					console.log(interest);
					setOptions(
						interest.map((option) => ({
							label: option,
							value: option,
						})),
					);
					setLoading(false);
				})
				.catch((err) => {
					console.log(err.message);
					new Error(err);
				});
		};
		if (
			page === 2 &&
			personalization &&
			personalization.industry?.length &&
			personalization.department?.length
		) {
			setLoading(true);
			fetchOptions();
		}
	}, [page, personalization]);
	return (
		<div className="flex flex-1 flex-col items-center justify-center">
			{page === 1 ? (
				<Step1 setPage={setPage} setPersonalization={setPersonalization} />
			) : (
				<>
					{personalization && (
						<Step2
							options={options}
							personalization={personalization}
							loading={loading}
						/>
					)}
				</>
			)}
			<SkipModal />
		</div>
	);
};

export default Personalization;
