import { atom } from "recoil";

export type CSVType = {
    name: string;
    dateTime: string;
}

export const csvState = atom<CSVType[]>({
    key: "csvState",
    default: [],
})