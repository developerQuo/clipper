import { atom } from "recoil";

export type SubKeywordInput = {
	// 대분류
	mainTopicKo: string;
	// 중분류
	subTopicKo: string;
};

type SubKeywordOutputInner = {
	en: string;
	ko: string;
};
export type SubKeywordOutput = SubKeywordOutputInner[] | undefined;
