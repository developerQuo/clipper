import React, { ForwardedRef } from 'react';

type InputProps = {
	label: string;
	onButtonClick?: (e: any) => void;
} & React.InputHTMLAttributes<HTMLInputElement>;

function CheckButton(
	{ label, value, onButtonClick, ...props }: InputProps,
	ref: ForwardedRef<HTMLInputElement>,
) {
	return (
		<div className="flex">
			<input
				ref={ref}
				type="checkbox"
				id={`${value}`}
				className="peer hidden"
				value={value}
				{...props}
			/>
			<label
				htmlFor={`${value}`}
				className="cursor-pointer select-none rounded-lg border-2 border-gray-200
     px-6 py-3 font-bold text-gray-400 transition-colors duration-200 ease-in-out peer-checked:border-gray-200 peer-checked:bg-gray-200 peer-checked:text-gray-900 "
				onClick={onButtonClick}
			>
				{label}
			</label>
		</div>
	);
}

export default React.forwardRef<HTMLInputElement, InputProps>(CheckButton);
