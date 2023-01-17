import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Papa from "papaparse";

export interface IForm {
	file: File;
}

export default function UploadButton() {
	const [uploading, setUploading] = useState(false);

	const { register, handleSubmit, getValues } = useForm<IForm>({
		mode: "onChange",
	});

	const handleUploadCSV = () => {
		setUploading(true);

		const files = getValues("file") as unknown as FileList;
		const file = files[0];

		console.log(file);

		if (file.type !== "text/csv") {
			setUploading(false);
			return;
		}

		const reader = new FileReader();
		reader.onloadend = ({ target }) => {
			const csv = Papa.parse(target?.result as any, { header: true });

			console.log(csv);
			// TODO: 전역 변수에 가공해서 저장
			// fetch("http://localhost:5001/uploads/csv", {
			// 	method: "POST",
			// 	headers: {
			// 		"Content-Type": "application/json",
			// 	},
			// 	body: JSON.stringify({
			// 		csv: csv?.data,
			// 	}),
			// })
			// 	.then(() => {
			// 		setUploading(false);
			// 		//   pong.success("CSV uploaded!");
			// 	})
			// 	.catch((error) => {
			// 		setUploading(false);
			// 		console.warn(error);
			// 	});
		};

		reader.readAsText(file);
	};

	return (
		<form onChange={handleSubmit(handleUploadCSV)}>
			<div className="mb-4">
				<input
					disabled={uploading}
					type="file"
					className="form-control file-input-bordered file-input w-full max-w-xs"
					{...register("file")}
				/>
			</div>
		</form>
	);
}
