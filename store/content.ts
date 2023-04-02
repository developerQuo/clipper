import { atom } from 'recoil';

export type Content = {
	id: string;
	title: string;
	summary: string;
	published_at: any;
	file_path: string;
	views: number;
	media: string | undefined;
	bookmark: boolean;
};

export type SelectedContent = Content | undefined;

export const SelectedContentState = atom<SelectedContent>({
	key: 'SelectedContentState',
	default: undefined,
});
