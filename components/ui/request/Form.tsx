/* 오프라인 서비스 신청 */

import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { ApiResponseType } from '../types';
import NotificationContext from '@/store/notification-context';
import Button from '@/components/ui/Button';
import { countryCodeOptions, industryOptions } from './data';
import { IForm } from './types';

const TITLE = 'request';

export default function Form() {
	const notificationCtx = useContext(NotificationContext);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<IForm>();

	const onSubmit = (data: IForm) => {
		notificationCtx.showNotification({
			title: 'loading...',
			message: '',
			status: 'pending',
		});

		fetch('/api/request', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data: ApiResponseType) => {
					throw new Error(`Retry ${TITLE}.`);
				});
			})
			.then((data: ApiResponseType) => {
				notificationCtx.showNotification({
					title: 'Success!',
					message: `Completed ${TITLE}`,
					status: 'success',
				});
			})
			.catch((error) => {
				notificationCtx.showNotification({
					title: 'Failed!',
					message: error.message,
					status: 'error',
				});
			});
	};

	return (
		<form
			className="form-control mx-auto gap-y-8 px-[24px] md:gap-y-[92px] lg:max-w-6xl lg:px-0"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div className="flex flex-col gap-x-20 gap-y-8 px-[24px] md:gap-y-[92px] lg:flex-row lg:gap-x-32 lg:px-0">
				<div className="form-control w-full items-start gap-4 text-[18px]">
					<label className="required text-base font-bold text-text-primary">
						About you
					</label>
					<div className="flex flex-1 flex-col gap-y-4">
						<div className="flex flex-1 gap-x-4">
							<div>
								<input
									type="text"
									placeholder="First Name"
									className="input-bordered input w-full focus:border-secondary focus:text-secondary"
									{...register('first_name', { required: true })}
								/>
								{errors.first_name?.type === 'required' && (
									<p role="alert" className="px-2 pt-1 text-sm text-error">
										Type First Name
									</p>
								)}
							</div>
							<div>
								<input
									type="text"
									placeholder="Last Name"
									className="input-bordered input w-full focus:border-secondary focus:text-secondary"
									{...register('last_name', { required: true })}
								/>
								{errors.last_name?.type === 'required' && (
									<p role="alert" className="px-2 pt-1 text-sm text-error">
										Type Last Name
									</p>
								)}
							</div>
						</div>
						<div>
							<input
								type="email"
								placeholder="Your business email"
								className="input-bordered input w-full focus:border-secondary focus:text-secondary"
								{...register('email', { required: true })}
							/>
							{errors.email?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									Type email address
								</p>
							)}
						</div>
						<div>
							<input
								type="text"
								placeholder="Job Title"
								className="input-bordered input w-full focus:border-secondary focus:text-secondary"
								{...register('job_title', { required: true })}
							/>
							{errors.job_title?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									Type Job Title
								</p>
							)}
						</div>
						<div>
							<input
								type="text"
								placeholder="Organization"
								className="input-bordered input w-full focus:border-secondary focus:text-secondary"
								{...register('organization', { required: true })}
							/>
							{errors.organization?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									Type Organization
								</p>
							)}
						</div>
					</div>
				</div>
				<div className="form-control w-full items-start gap-4 text-[18px]">
					<label className="required text-base font-bold text-text-primary">
						About your business
					</label>
					<div className="flex flex-1 flex-col gap-y-4">
						<div>
							<select
								className="select-bordered select w-full focus:border-secondary focus:text-secondary"
								{...register('industry', {
									required: 'Select Industry',
								})}
							>
								{' '}
								<option disabled selected value={''}>
									Your industry
								</option>
								{industryOptions.map(({ label, value }) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
							{errors.industry?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									{errors.industry.message}
								</p>
							)}
						</div>
						<div>
							<select
								className="select-bordered select w-full focus:border-secondary focus:text-secondary"
								{...register('country', {
									required: 'Select Country',
								})}
							>
								{' '}
								<option disabled selected value={''}>
									Your location
								</option>
								{countryCodeOptions.map(({ label, value }) => (
									<option key={value} value={value}>
										{label}
									</option>
								))}
							</select>
							{errors.country?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									{errors.country.message}
								</p>
							)}
						</div>
						<div>
							<input
								type="url"
								placeholder="Company/Service URL"
								className="input-bordered input w-full focus:border-secondary focus:text-secondary"
								{...register('homepage', { required: true })}
							/>
							{errors.homepage?.type === 'required' && (
								<p role="alert" className="px-2 pt-1 text-sm text-error">
									Type URL
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="form-control w-full">
				<div className="flex flex-col items-start gap-4">
					<label className="text-base font-bold text-text-primary">Note</label>
					<textarea
						className="textarea-bordered textarea h-[200px] w-full focus:border-secondary focus:text-secondary"
						placeholder="Type Note (optional)"
						{...register('note')}
					/>
				</div>
			</div>
			<Button className="btn-primary max-w-xs self-center">Submit</Button>
		</form>
	);
}
