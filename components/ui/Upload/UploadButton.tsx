import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Papa from "papaparse";
import { useSetRecoilState } from "recoil";
import { csvState, CSVType } from "../../../store/recoilState";

export interface IForm {
	file: File;
}

export default function UploadButton() {
	const setCsvData = useSetRecoilState<CSVType[]>(csvState);
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

			// TODO: 전역 변수에 가공해서 저장
			console.log(csv);
			try {
				const csvData = csv.data.map((row: any) => ({
					name: row["name"],
					phone: row["phone"],
					dateTime: new Date().toISOString(),
					// dateTime: row["dateTime"],
				}));
				setCsvData(csvData);
			} catch (error) {
				console.warn(error);
			} finally {
				setUploading(false);
			}
		};

		reader.readAsText(file);
	};

	return (
		<form onChange={handleSubmit(handleUploadCSV)} className="flex justify-end">
			<input
				disabled={uploading}
				type="file"
				className="form-control file-input-bordered file-input w-full max-w-xs"
				{...register("file")}
			/>
		</form>
	);
}
