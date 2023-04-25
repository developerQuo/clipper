import { Content } from '@/types/content';
import { atom } from 'recoil';

export type SelectedContent = Content | undefined;

export const SelectedContentState = atom<SelectedContent>({
	key: 'SelectedContentState',
	default: undefined,
});
