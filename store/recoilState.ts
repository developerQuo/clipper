import { atom } from "recoil";

export type CSVType = {
	name: string;
	phone: string;
	datetime: string;
};

export const csvState = atom<CSVType[]>({
	key: "csvDataState",
	default: [],
});
