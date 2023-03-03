import { atom } from "recoil";

export type ReportInput = {
	script: string;
};

export type ReportOutput =
	| {
			today_summary: string;
			report: string;
			insight: string;
			cited_web_source: Array<{ title: string; url: string }>;
	  }
	| undefined;

export const ReportOutputState = atom<ReportOutput>({
	key: "ReportOutputState",
	default: undefined,
});

export type SubKeywrodInput = {
	// 대분류
	mainCategory: string;
	// 중분류
	middleCategory: string;
};
export type SubKeywrodOutput = string[] | undefined;

export type QuestionInput = {
	script: string;
};

export type QuestionOutput = string[] | undefined;

export const QuestionOutputState = atom<QuestionOutput>({
	key: "QuestionOutputState",
	default: undefined,
});
