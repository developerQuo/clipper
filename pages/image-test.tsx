import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";

export type IForm = { prompt: string };

export default function DBTest(props: any) {
	const [result, setResult] = useState<string[] | null>(null);
	const { register, handleSubmit } = useForm<IForm>();

	const onSubmit = (values: IForm) => {
		fetch("/api/test/image", {
			method: "POST",
			body: JSON.stringify(values),
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}

				return res.json().then((data) => {
					throw new Error(`${data}`);
				});
			})
			.then(({ image_url }: { image_url: string[] }) => {
				console.log(image_url);
				setResult(image_url);
			})
			.catch((error) => {
				console.log(error);
			});
	};
	return (
		<div className="space-y-20">
			<form
				className="form-control flex w-full flex-col items-center gap-y-8 md:gap-y-[48px]"
				onSubmit={handleSubmit(onSubmit)}
			>
				<div className="form-control w-full">
					<div className="flex flex-col items-start gap-4">
						<label className="text-base font-bold text-text-primary">
							프롬프트
						</label>
						<textarea
							className="textarea-bordered textarea w-full focus:border-secondary focus:text-secondary"
							placeholder="클립 이름을 입력하세요."
							{...register("prompt", {
								required: true,
							})}
						/>
					</div>
				</div>
				<button className="btn-primary btn">테스트 생성</button>
			</form>
			{/* <div>{result}</div> */}
			<div className="grid grid-cols-4 gap-4">
				{result && result.map((url) => <img key={url} src={url} />)}
			</div>
		</div>
	);
}

// export async function getServerSideProps(context: any) {
// 	const supabase = createClient(
// 		process.env.DATABASE_URL ?? "",
// 		process.env.DATABASE_API_KEY ?? "",
// 	);
// 	let { data } = await supabase.from("test").select();
// 	return {
// 		props: {
// 			test: data,
// 		},
// 	};
// }
