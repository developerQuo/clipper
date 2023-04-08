import { atom } from 'recoil';

export type GeneratedContent = {
	id: string;
	title: string;
	summary: string;
	published_at: any;
	views: number;
	bookmark: boolean; // 유저 북마크 여부
	content: string;
};

export type SelectedGeneratedContent = Partial<GeneratedContent> | undefined;

export const SelectedGeneratedContentState = atom<SelectedGeneratedContent>({
	key: 'SelectedGeneratedContentState',
	default: undefined,
});
