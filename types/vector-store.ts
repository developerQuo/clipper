export type MetaData = {
	source: string;
	media: string;
	title: string;
	page: number;
	totalPages: number;
};

export type DocumentType = {
	pageContent: string;
	metadata: MetaData;
};
