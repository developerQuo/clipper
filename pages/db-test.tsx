import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { authOptions } from "./api/auth/[...nextauth]";

// import { supabase } from "../lib/supabaseClient";

export default function DBTest(props: any) {
	console.log(props.test);

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
	const supabase = createClient(
		process.env.DATABASE_URL ?? "",
		process.env.DATABASE_API_KEY ?? "",
	);
	let { data } = await supabase.from("test").select();
	return {
		props: {
			test: data,
		},
	};
}
