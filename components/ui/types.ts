export interface OptionType {
	label?: string;
	value: string | number;
}

export interface RadioOptionProps extends OptionType {
	checked?: boolean;
}

export type ApiResponseType = {
	ok: boolean;
	message: string;
};
