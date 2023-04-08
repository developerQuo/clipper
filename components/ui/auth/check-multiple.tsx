import React, { ForwardedRef } from 'react';
import { OptionType } from '../types';
import CheckButton from './button';

type InputProps = {
	options: OptionType[];
	checkedOptions?: string[];
	maxChecked?: number;
} & React.InputHTMLAttributes<HTMLInputElement>;

function CheckMultiple(
	{ options, checkedOptions, maxChecked = 2, ...props }: InputProps,
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
					onButtonClick={(e) => {
						if (
							checkedOptions &&
							checkedOptions.length > maxChecked - 1 &&
							!checkedOptions.includes(value as string)
						) {
							e.preventDefault();
						}
					}}
					{...props}
				/>
			))}
		</div>
	);
}

export default React.forwardRef<HTMLInputElement, InputProps>(CheckMultiple);
