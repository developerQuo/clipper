export type Page = 1 | 2;

export interface IForm {
	industry: string[];
	department: string[];
	interest: string[];
}

export type Page1Form = Pick<IForm, 'industry' | 'department'>;
export type Page2Form = Pick<IForm, 'interest'>;
