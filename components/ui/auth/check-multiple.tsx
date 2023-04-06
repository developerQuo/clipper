import React, { ForwardedRef } from 'react';
import { OptionType } from '../types';
import CheckButton from './button';

type InputProps = {
	options: OptionType[];
} & React.InputHTMLAttributes<HTMLInputElement>;

function CheckMultiple(
	{ options, ...props }: InputProps,
	ref: ForwardedRef<HTMLInputElement>,
) {
	return (
		<div className="flex flex-wrap justify-center gap-4">
			{options.map(({ value, label }, index) => (
				<CheckButton
					key={index}
					ref={ref}
					value={value}
					label={label!}
					{...props}
				/>
			))}
		</div>
	);
}

export default React.forwardRef<HTMLInputElement, InputProps>(CheckMultiple);
