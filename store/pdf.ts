import { atom } from 'recoil';

export type SelectedPDFType =
	| {
			title: string;
			from: string;
	  }
	| undefined;

export const SelectedPDFState = atom<SelectedPDFType>({
	key: 'SelectedPDFState',
	default: undefined,
});
