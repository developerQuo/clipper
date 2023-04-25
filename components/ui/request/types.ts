type Request = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	job_title: string;
	organization: string;
	industry: string;
	country: string;
	homepage: string;
	note?: string;
	created_at: string;
};

type IForm = Omit<Request, 'id'>;

export type { Request, IForm };
