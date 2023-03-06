import { atom } from "recoil";

export type SelectedKeyType = string | undefined;

export const SelectedKeyState = atom<SelectedKeyType>({
	key: "SelectedKeyState",
	default: undefined,
});
