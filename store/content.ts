import { atom } from 'recoil';

export type Content = {
	id: string;
	title: string;
	summary: string;
	published_at: any;
	file_path: string;
	views: number;
	media: string | undefined;
	bookmark: boolean; // 유저 북마크 여부
	tags: string[];
	bookmarks: number; // 전체 유저 북마크 수
	faq: string[];
};

export type SelectedContent = Content | undefined;

export const SelectedContentState = atom<SelectedContent>({
	key: 'SelectedContentState',
	default: undefined,
});
