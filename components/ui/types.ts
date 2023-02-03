export interface RadioOptionProps {
	label?: string;
	value: string | number;
	checked?: boolean;
}

export type ApiResponseType = {
	ok: boolean;
	message: string;
};
