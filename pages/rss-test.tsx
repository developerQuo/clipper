import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Parser from "rss-parser";
import { authOptions } from "./api/auth/[...nextauth]";

// import { supabase } from "../lib/supabaseClient";

// 테스트용
// rss 파싱해서, 가져다 쓸 기사 목록 생성
export default function DBTest(props: any) {
	console.log(props.cnbcEconomyFeeds);
	console.log(props.cnbcBusinessFeeds);
	console.log(props.cnnFeeds);
	console.log(props.forbesFeeds);

	const [createdTest, createTest] = useState(null);

	const createTestHandler = async () => {
		const supabase = createClient(
			process.env.DATABASE_URL ?? "",
			process.env.DATABASE_API_KEY ?? "",
		);
		const { data, error } = await supabase
			.from("test")
			.insert([{ is_ok: true }]);
		console.log(error);
		createTest(data);
	};
	return (
		<div className="space-y-20">
			<button className="btn-primary btn" onClick={createTestHandler}>
				테스트 생성
			</button>
			<div>{createdTest}</div>
		</div>
	);
}

export async function getServerSideProps(context: any) {
	const parser = new Parser();
	const mailFeeds = await parser.parseURL("https://www.mk.co.kr/rss/30100041/"); // 매일경제
	const fnFeeds = await parser.parseURL(
		"https://www.fnnews.com/rss/r20/fn_realnews_economy.xml",
	); // 파이낸셜뉴스
	const cnbcEconomyFeeds = await parser.parseURL(
		"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258",
	); // CNBC Economy
	const cnbcBusinessFeeds = await parser.parseURL(
		"https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=10001147",
	); // CNBC Business
	const cnnFeeds = await parser.parseURL(
		"http://rss.cnn.com/rss/money_news_international.rss",
	); // CNN
	const forbesFeeds = await parser.parseURL(
		"https://www.forbes.com/money/feed/",
	); // Forbes Money

	return {
		props: {
			mailFeeds: normalizeRssFeeds(mailFeeds),
			fnFeeds: normalizeRssFeeds(fnFeeds),
			cnbcEconomyFeeds: normalizeRssFeeds(cnbcEconomyFeeds),
			cnbcBusinessFeeds: normalizeRssFeeds(cnbcBusinessFeeds),
			cnnFeeds: normalizeRssFeeds(cnnFeeds),
			forbesFeeds: normalizeRssFeeds(forbesFeeds),
		},
	};
}

type RssFeedOutput = {
	title: string;
	link: string;
	pubDate: string;
};

const normalizeRssFeeds: (
	feeds: Parser.Output<{ [key: string]: any }>,
) => Array<RssFeedOutput> = (feeds: Parser.Output<{ [key: string]: any }>) => {
	return feeds.items.reduce<Array<RssFeedOutput>>((acc, cur, i, arr) => {
		// 하루 이내에 발간된 글만 가져오기
		if (
			cur.pubDate &&
			new Date(cur.pubDate) > new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
		) {
			acc.push({ title: cur.title!, link: cur.link!, pubDate: cur.pubDate });
		} else {
			// 하루 이내에 발간된 글이 아니면, 함수 종료
			arr.splice(i);
		}
		return acc;
	}, []);
};
