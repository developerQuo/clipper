import React from "react";
import Table from "./Table";
import UploadButton from "./UploadButton";

const Upload = () => {
	// TODO: 메시지 발송 폼에 전역변수 데이터 바인딩
	return (
		<div className="space-y-12">
			<div className="flex justify-center">
				<h1 className="text-3xl font-bold">CSV 업로드</h1>
			</div>

			<div className="space-y-6">
				<UploadButton />
				<Table />
			</div>
		</div>
	);
};

Upload.propTypes = {};

export default Upload;
