import { PostgrestSingleResponse } from "@supabase/supabase-js";

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
};

export type QueryType = PostgrestSingleResponse<Content[]>;