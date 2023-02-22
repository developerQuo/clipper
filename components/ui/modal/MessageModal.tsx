import React from "react";

type InputProps = {
	title: string;
	description: string;
	state: boolean;
	setState: (state: boolean) => void;
	additionalAction?: () => void;
};

export default function MessageModal({
	title,
	description,
	state,
	setState,
	additionalAction,
}: InputProps) {
	const onCancel = () => {
		setState(false);
		if (additionalAction) {
			additionalAction();
		}
	};

	return (
		<>
			<input
				type="checkbox"
				id="message-login"
				className="modal-toggle"
				checked={state}
				readOnly
			/>
			<div className="modal">
				<div className="modal-box">
					<h3 className="text-lg font-bold">{title}</h3>
					<p className="py-4">{description}</p>
					<div className="modal-action">
						<label
							htmlFor="message-login"
							className="btn w-20"
							onClick={onCancel}
						>
							닫기
						</label>
					</div>
				</div>
			</div>
		</>
	);
}
