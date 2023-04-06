import { useRouter } from 'next/router';
import { useRef } from 'react';

export default function SkipModal() {
	const router = useRouter();
	const ref = useRef<HTMLInputElement>(null);
	return (
		<>
			<input
				ref={ref}
				type="checkbox"
				id="skip-personalization"
				className="modal-toggle"
			/>
			<div className="modal modal-bottom sm:modal-middle">
				<div className="modal-box text-center">
					<p className="py-4">
						이 단계를 건너뛰면 개인화 보고서 제공이 되지 않습니다.
					</p>
					<p className="py-4">정말 건너 뛸까요?</p>
					<div className="modal-action">
						<label
							className="btn-outline btn"
							onClick={() => {
								router.push('/');
							}}
						>
							예
						</label>
						<label htmlFor="skip-personalization" className="btn-primary btn">
							아니오
						</label>
					</div>
				</div>
			</div>
		</>
	);
}
